import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock prisma used by attendance service
vi.mock('../../src/config/db.js', () => ({
  prisma: {
    shift: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    attendance: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

vi.mock('../../src/utils/logger.js', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

import { prisma } from '../../src/config/db.js';
import attendanceService from '../../src/services/attendance.service.js';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('attendanceService.validateCheckIn', () => {
  const baseShift = {
    start_time: '08:00',
    end_time: '17:00',
    early_check_in_minutes: 30,
    late_checkout_minutes: 30,
  };

  it('rejects when already checked in', () => {
    const res = attendanceService.validateCheckIn(baseShift, new Date(), true);
    expect(res.valid).toBe(false);
    expect(res.status).toBe('already_checked_in');
  });

  it('rejects when too early', () => {
    // earliest = 08:00 - 30 => 07:30
    const now = new Date();
    now.setHours(7, 0, 0, 0); // 07:00
    const res = attendanceService.validateCheckIn(baseShift, now, false);
    expect(res.valid).toBe(false);
    expect(res.status).toBe('too_early');
  });

  it('flags late when after grace period', () => {
    // grace ends 08:15
    const now = new Date();
    now.setHours(8, 20, 0, 0); // 08:20
    const res = attendanceService.validateCheckIn(baseShift, now, false);
    expect(res.valid).toBe(true);
    expect(res.status).toBe('late');
    expect(res.isLate).toBe(true);
    expect(res.lateMinutes).toBeGreaterThan(0);
  });
});

describe('attendanceService.validateCheckOut', () => {
  const shift = {
    start_time: '08:00',
    end_time: '17:00',
    early_check_in_minutes: 30,
    late_checkout_minutes: 30,
  };

  it('rejects when no check-in', () => {
    const res = attendanceService.validateCheckOut(shift, null, new Date());
    expect(res.valid).toBe(false);
  });

  it('accepts within allowed window and returns work minutes', () => {
    const checkIn = new Date();
    checkIn.setHours(8, 0, 0, 0);
    const now = new Date();
    now.setHours(17, 0, 0, 0);

    const res = attendanceService.validateCheckOut(shift, checkIn, now);
    expect(res.valid).toBe(true);
    expect(res.workMinutes).toBeGreaterThan(0);
  });
});

describe('attendanceService.checkIn/checkOut', () => {
  const shift = {
    id: 1,
    start_time: '08:00',
    end_time: '17:00',
    early_check_in_minutes: 30,
    late_checkout_minutes: 30,
  };

  it('checkIn creates/updates attendance on valid validation', async () => {
    prisma.shift.findUnique.mockResolvedValue(shift);
    prisma.attendance.findUnique.mockResolvedValue(null);
    prisma.attendance.upsert.mockResolvedValue({ id: 1, check_in: new Date() });

    const spy = vi
      .spyOn(attendanceService, 'validateCheckIn')
      .mockReturnValue({ valid: true, status: 'on_time' });

    const res = await attendanceService.checkIn(10, 1);

    expect(spy).toHaveBeenCalled();
    expect(res.valid).toBe(true);
    expect(prisma.attendance.upsert).toHaveBeenCalled();
  });

  it('checkOut updates attendance when valid', async () => {
    prisma.shift.findUnique.mockResolvedValue(shift);
    prisma.attendance.findUnique.mockResolvedValue({ check_in: new Date() });
    prisma.attendance.update.mockResolvedValue({ id: 1, check_out: new Date(), work_hours: 8 });

    const spy = vi
      .spyOn(attendanceService, 'validateCheckOut')
      .mockReturnValue({ valid: true, workMinutes: 480, earlyMinutes: 0 });

    const res = await attendanceService.checkOut(10, 1);

    expect(spy).toHaveBeenCalled();
    expect(res.valid).toBe(true);
    expect(prisma.attendance.update).toHaveBeenCalled();
  });
});
