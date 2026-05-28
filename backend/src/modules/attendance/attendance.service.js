import logger from '../../shared/utils/logger.js';

import { attendanceRepository } from './attendance.repository.js';

const attendanceService = {
  async getShifts() {
    return attendanceRepository.findActiveShifts();
  },

  async getShiftById(shiftId) {
    return attendanceRepository.findShiftById(shiftId);
  },

  async getEmployeeShift() {
    return attendanceRepository.findFirstActiveShift();
  },

  validateCheckIn(shift, now, checkedInToday) {
    if (checkedInToday) {
      return {
        valid: false,
        message: 'Bạn đã check-in hôm nay rồi',
        status: 'already_checked_in',
      };
    }

    const shiftStart = this.convertTimeToMinutes(shift.start_time);
    const nowMinutes = this.convertTimeToMinutes(now);

    const earliestCheckIn = shiftStart - shift.early_check_in_minutes;
    const gracePeriod = shiftStart + 15;
    const maxLateAllowed = shiftStart + 30;

    if (nowMinutes < earliestCheckIn) {
      const minutesLeft = earliestCheckIn - nowMinutes;
      return {
        valid: false,
        message: `Sớm quá. Bạn có thể check-in sau ${minutesLeft} phút`,
        status: 'too_early',
      };
    }

    if (nowMinutes > maxLateAllowed) {
      const lateBy = nowMinutes - shiftStart;
      return {
        valid: false,
        message: `Quá muộn (${lateBy} phút). Vui lòng liên hệ HR để xin phép`,
        status: 'too_late',
      };
    }

    if (nowMinutes > gracePeriod) {
      const lateMinutes = nowMinutes - shiftStart;
      return {
        valid: true,
        message: `⚠️ Cảnh báo: Bạn đi trễ ${lateMinutes} phút`,
        status: 'late',
        isLate: true,
        lateMinutes,
      };
    }

    return {
      valid: true,
      message: 'Check-in thành công',
      status: 'on_time',
    };
  },

  validateCheckOut(shift, checkInTime, now) {
    if (!checkInTime) {
      return {
        valid: false,
        message: 'Bạn chưa check-in. Vui lòng check-in trước',
      };
    }

    const shiftEnd = this.convertTimeToMinutes(shift.end_time);
    const nowMinutes = this.convertTimeToMinutes(now);

    const maxEarlyAllowed = shiftEnd - 15;
    const latestCheckOut = shiftEnd + shift.late_checkout_minutes;

    if (nowMinutes < maxEarlyAllowed) {
      const minutesEarly = shiftEnd - nowMinutes;
      return {
        valid: false,
        message: `Về quá sớm (${minutesEarly} phút). Vui lòng liên hệ HR để xin phép`,
      };
    }

    if (nowMinutes > latestCheckOut) {
      return {
        valid: false,
        message: 'Quá giờ check-out. Vui lòng liên hệ HR',
      };
    }

    const workMinutes = this.getWorkMinutes(checkInTime, now);
    const isEarly = nowMinutes < shiftEnd;
    const earlyMinutes = isEarly ? shiftEnd - nowMinutes : 0;

    return {
      valid: true,
      message: isEarly ? `⚠️ Cảnh báo: Bạn về sớm ${earlyMinutes} phút` : 'Check-out thành công',
      workMinutes,
      isEarly,
      earlyMinutes,
    };
  },

  async checkIn(employeeId, shiftId) {
    try {
      const shift = await this.getShiftById(shiftId);
      if (!shift) {
        throw new Error('Shift không tồn tại');
      }

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);

      const existingAttendance = await attendanceRepository.findAttendanceByEmployeeDateShift(
        employeeId,
        today,
        shiftId,
      );

      const validation = this.validateCheckIn(shift, now, !!existingAttendance);
      if (!validation.valid) {
        return validation;
      }

      const attendance = await attendanceRepository.upsertAttendanceByEmployeeDateShift(
        employeeId,
        today,
        shiftId,
        {
          check_in: now,
          status: validation.isLate ? 'late' : 'present',
          late_minutes: validation.lateMinutes || 0,
        },
        {
          employee_id: employeeId,
          shift_id: shiftId,
          date: today,
          check_in: now,
          status: validation.isLate ? 'late' : 'present',
          late_minutes: validation.lateMinutes || 0,
        },
      );

      return {
        valid: true,
        message: `Check-in lúc ${this.formatTime(now)} ${validation.isLate ? '⚠️ (đi trễ)' : '✅'}`,
        status: validation.status,
        attendance,
      };
    } catch (error) {
      logger.error('Check-in error:', error);
      return {
        valid: false,
        message: 'Lỗi khi check-in. Vui lòng thử lại',
      };
    }
  },

  async checkOut(employeeId, shiftId) {
    try {
      const shift = await this.getShiftById(shiftId);
      if (!shift) {
        throw new Error('Shift không tồn tại');
      }

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);

      const attendance = await attendanceRepository.findAttendanceByEmployeeDateShift(
        employeeId,
        today,
        shiftId,
      );

      const validation = this.validateCheckOut(shift, attendance?.check_in, now);
      if (!validation.valid) {
        return validation;
      }

      const workHours = (validation.workMinutes / 60).toFixed(2);

      const updatedAttendance = await attendanceRepository.updateAttendanceByEmployeeDateShift(
        employeeId,
        today,
        shiftId,
        {
          check_out: now,
          work_hours: parseFloat(workHours),
          early_minutes: validation.earlyMinutes || 0,
        },
      );

      return {
        valid: true,
        message: `Check-out lúc ${this.formatTime(now)} ✅`,
        workHours,
        attendance: updatedAttendance,
      };
    } catch (error) {
      logger.error('Check-out error:', error);
      return {
        valid: false,
        message: 'Lỗi khi check-out. Vui lòng thử lại',
      };
    }
  },

  async getTodayAttendance(employeeId, shiftId = null) {
    const today = new Date();
    today.setHours(12, 0, 0, 0);

    if (shiftId) {
      return attendanceRepository.findTodayAttendanceByEmployeeAndShift(employeeId, today, shiftId);
    }

    return attendanceRepository.findLatestTodayAttendanceByEmployee(employeeId, today);
  },

  async getMonthlyWorkHours(employeeId, year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendances = await attendanceRepository.findMonthlyAttendances(
      employeeId,
      startDate,
      endDate,
    );

    const totalHours = attendances.reduce((sum, att) => {
      const hours = parseFloat(att.work_hours) || 0;
      return sum + hours;
    }, 0);

    return {
      year,
      month,
      totalHours: parseFloat(totalHours.toFixed(2)),
      attendanceCount: attendances.length,
      attendances,
    };
  },

  async getAttendanceHistory(employeeId, fromDate, toDate) {
    return attendanceRepository.findAttendanceHistory(employeeId, fromDate, toDate);
  },

  async getAllAttendances(filters = {}) {
    const { employeeId, fromDate, toDate, status, skip = 0, take = 10 } = filters;

    const where = { is_deleted: false };
    if (employeeId) where.employee_id = employeeId;
    if (status) where.status = status;
    if (fromDate || toDate) {
      where.date = {};
      if (fromDate) where.date.gte = fromDate;
      if (toDate) where.date.lte = toDate;
    }

    const [attendances, total] = await Promise.all([
      attendanceRepository.findManyAttendances(where, skip, take),
      attendanceRepository.countAttendances(where),
    ]);

    return {
      data: attendances,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
      pages: Math.ceil(total / take),
    };
  },

  convertTimeToMinutes(timeObj) {
    if (typeof timeObj === 'string') {
      const [hours, minutes] = timeObj.split(':').map(Number);
      return hours * 60 + minutes;
    }

    if (timeObj.getFullYear() === 1970) {
      const utcHours = timeObj.getUTCHours();
      const utcMinutes = timeObj.getUTCMinutes();
      const vnHours = (utcHours + 7) % 24;
      return vnHours * 60 + utcMinutes;
    }

    return timeObj.getHours() * 60 + timeObj.getMinutes();
  },

  getWorkMinutes(checkInTime, checkOutTime) {
    const diffMs = checkOutTime - new Date(checkInTime);
    return Math.floor(diffMs / 60000);
  },

  formatTime(date) {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  formatDate(date) {
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  },

  async updateAttendance(attendanceId, updates) {
    const attendance = await attendanceRepository.findAttendanceWithShiftById(attendanceId);

    if (!attendance || attendance.is_deleted) {
      throw new Error('Không tìm thấy bản ghi chấm công');
    }

    let workHours = updates.work_hours;
    if (updates.check_in && updates.check_out) {
      const checkInTime = new Date(updates.check_in);
      const checkOutTime = new Date(updates.check_out);
      const workMinutes = this.getWorkMinutes(checkInTime, checkOutTime);
      workHours = (workMinutes / 60).toFixed(2);
    }

    return attendanceRepository.updateAttendanceById(attendanceId, {
      ...updates,
      work_hours: workHours,
      updated_at: new Date(),
    });
  },

  async calculateLateEarlyMinutes(shiftId, checkInTime, checkOutTime) {
    const shift = await this.getShiftById(shiftId);
    if (!shift) {
      throw new Error('Shift không tồn tại');
    }

    const shiftStart = this.convertTimeToMinutes(shift.start_time);
    const shiftEnd = this.convertTimeToMinutes(shift.end_time);

    let lateMinutes = 0;
    let earlyMinutes = 0;

    if (checkInTime) {
      const checkInMinutes = this.convertTimeToMinutes(checkInTime);
      const gracePeriod = shiftStart + 15;

      if (checkInMinutes > gracePeriod) {
        lateMinutes = checkInMinutes - shiftStart;
      }
    }

    if (checkOutTime) {
      const checkOutMinutes = this.convertTimeToMinutes(checkOutTime);
      const maxEarlyCheckOut = shiftEnd - 15;

      if (checkOutMinutes < maxEarlyCheckOut) {
        earlyMinutes = shiftEnd - checkOutMinutes;
      }
    }

    return { lateMinutes, earlyMinutes };
  },

  async deleteAttendance(attendanceId) {
    const attendance = await attendanceRepository.findAttendanceById(attendanceId);

    if (!attendance || attendance.is_deleted) {
      throw new Error('Không tìm thấy bản ghi chấm công');
    }

    return attendanceRepository.softDeleteAttendanceById(attendanceId);
  },
};

export { attendanceService };
export default attendanceService;
