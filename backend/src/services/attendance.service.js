import { prisma } from '../config/db.js';
import logger from '../utils/logger.js';

// Convert class-based service to function/object-based for consistency
const attendanceService = {
  /**
   * Get shift by ID
   */
  async getShiftById(shiftId) {
    return prisma.shift.findUnique({
      where: { id: shiftId },
    });
  },

  /**
   * Get employee's current shift (mặc định shift đầu tiên, sau này có thể add shift_id vào employee)
   */
  async getEmployeeShift(employeeId) {
    // TODO: Sau này thêm shift_id vào employee model để liên kết
    // Tạm thời lấy shift đầu tiên
    const shift = await prisma.shift.findFirst({
      where: { is_deleted: false },
    });
    return shift;
  },

  /**
   * Validate check-in time
   * Returns: { valid: boolean, message: string, status: string }
   */
  validateCheckIn(shift, now, checkedInToday) {
    if (checkedInToday) {
      return {
        valid: false,
        message: 'Bạn đã check-in hôm nay rồi',
        status: 'already_checked_in',
      };
    }

    // Chuyển đổi time từ shift
    const shiftStart = this.convertTimeToMinutes(shift.start_time);
    const shiftEnd = this.convertTimeToMinutes(shift.end_time);
    const nowMinutes = this.convertTimeToMinutes(now);

    console.log('=== DEBUG CHECK-IN ===');
    console.log('shift.start_time:', shift.start_time);
    console.log('now:', now);
    console.log('shiftStart (minutes):', shiftStart);
    console.log('nowMinutes:', nowMinutes);
    console.log('Late by:', nowMinutes - shiftStart);
    console.log('=====================');

    const earliestCheckIn = shiftStart - shift.early_check_in_minutes;
    const gracePeriod = shiftStart + 15; // Grace period: 15 phút được tính đúng giờ
    const maxLateAllowed = shiftStart + 30; // Muộn tối đa cho phép: 30 phút

    if (nowMinutes < earliestCheckIn) {
      const minutesLeft = earliestCheckIn - nowMinutes;
      return {
        valid: false,
        message: `Sớm quá. Bạn có thể check-in sau ${minutesLeft} phút`,
        status: 'too_early',
      };
    }

    // Muộn quá 30 phút → Bị từ chối
    if (nowMinutes > maxLateAllowed) {
      const lateBy = nowMinutes - shiftStart;
      return {
        valid: false,
        message: `Quá muộn (${lateBy} phút). Vui lòng liên hệ HR để xin phép`,
        status: 'too_late',
      };
    }

    // Muộn 16-30 phút → Cảnh báo và ghi nhận muộn
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

    // Trong grace period (0-15 phút sau giờ bắt đầu) → Vẫn tính đúng giờ
    return {
      valid: true,
      message: 'Check-in thành công',
      status: 'on_time',
    };
  },

  /**
   * Validate check-out time
   * Returns: { valid: boolean, message: string }
   */
  validateCheckOut(shift, checkInTime, now) {
    if (!checkInTime) {
      return {
        valid: false,
        message: 'Bạn chưa check-in. Vui lòng check-in trước',
      };
    }

    const shiftEnd = this.convertTimeToMinutes(shift.end_time);
    const nowMinutes = this.convertTimeToMinutes(now);

    const maxEarlyAllowed = shiftEnd - 15; // Về sớm tối đa cho phép: 15 phút
    const latestCheckOut = shiftEnd + shift.late_checkout_minutes;

    // Về sớm quá 15 phút → Bị từ chối
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

    // Tính work minutes
    const workMinutes = this.getWorkMinutes(checkInTime, now);

    // Kiểm tra về sớm 1-15 phút → Cảnh báo
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

  /**
   * Check-in employee
   */
  async checkIn(employeeId, shiftId) {
    try {
      const shift = await this.getShiftById(shiftId);
      if (!shift) {
        throw new Error('Shift không tồn tại');
      }

      const now = new Date();
      // Set date at noon to avoid timezone conversion issues
      const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        12,
        0,
        0,
        0
      );

      // Kiểm tra đã check-in ca này hôm nay chưa
      const existingAttendance = await prisma.attendance.findUnique({
        where: {
          employee_id_date_shift_id: {
            employee_id: employeeId,
            date: today,
            shift_id: shiftId,
          },
        },
      });

      // Validate
      const validation = this.validateCheckIn(shift, now, !!existingAttendance);
      if (!validation.valid) {
        return validation;
      }

      // Tạo hoặc cập nhật attendance
      const attendance = await prisma.attendance.upsert({
        where: {
          employee_id_date_shift_id: {
            employee_id: employeeId,
            date: today,
            shift_id: shiftId,
          },
        },
        update: {
          check_in: now,
          status: validation.isLate ? 'late' : 'present',
          late_minutes: validation.lateMinutes || 0,
        },
        create: {
          employee_id: employeeId,
          shift_id: shiftId,
          date: today,
          check_in: now,
          status: validation.isLate ? 'late' : 'present',
          late_minutes: validation.lateMinutes || 0,
        },
      });

      console.log('Check-in success:', attendance);

      return {
        valid: true,
        message: `Check-in lúc ${this.formatTime(now)} ${validation.isLate ? '⚠️ (đi trễ)' : '✅'
          }`,
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

  /**
   * Check-out employee
   */
  async checkOut(employeeId, shiftId) {
    try {
      const shift = await this.getShiftById(shiftId);
      if (!shift) {
        throw new Error('Shift không tồn tại');
      }

      const now = new Date();
      // Set date at noon to avoid timezone conversion issues
      const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        12,
        0,
        0,
        0
      );

      // Lấy attendance của hôm nay
      const attendance = await prisma.attendance.findUnique({
        where: {
          employee_id_date_shift_id: {
            employee_id: employeeId,
            date: today,
            shift_id: shiftId,
          },
        },
      });

      // Validate
      const validation = this.validateCheckOut(shift, attendance?.check_in, now);
      if (!validation.valid) {
        return validation;
      }

      // Tính giờ làm
      const workHours = (validation.workMinutes / 60).toFixed(2);

      // Cập nhật attendance
      const updatedAttendance = await prisma.attendance.update({
        where: {
          employee_id_date_shift_id: {
            employee_id: employeeId,
            date: today,
            shift_id: shiftId,
          },
        },
        data: {
          check_out: now,
          work_hours: parseFloat(workHours),
          early_minutes: validation.earlyMinutes || 0,
        },
      });

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

  /**
   * Get today's attendance for employee
   */
  async getTodayAttendance(employeeId, shiftId = null) {
    const today = new Date();
    // Set date at noon to avoid timezone conversion issues
    today.setHours(12, 0, 0, 0);
    if (shiftId) {
      return prisma.attendance.findUnique({
        where: {
          employee_id_date_shift_id: {
            employee_id: employeeId,
            date: today,
            shift_id: shiftId,
          },
        },
        include: { shift: true },
      });
    }

    return prisma.attendance.findFirst({
      where: {
        employee_id: employeeId,
        date: today,
        is_deleted: false,
      },
      orderBy: {
        check_in: 'desc',
      },
      include: {
        shift: true,
      },
    });
  },

  /**
   * Get monthly work hours for employee
   */
  async getMonthlyWorkHours(employeeId, year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendances = await prisma.attendance.findMany({
      where: {
        employee_id: employeeId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        is_deleted: false,
      },
    });

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

  /**
   * Get attendance history for employee
   */
  async getAttendanceHistory(employeeId, fromDate, toDate) {
    return prisma.attendance.findMany({
      where: {
        employee_id: employeeId,
        date: {
          gte: fromDate,
          lte: toDate,
        },
        is_deleted: false,
      },
      include: {
        shift: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  },

  /**
   * Get all attendances (admin/hr)
   */
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
      prisma.attendance.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              full_name: true,
              email: true,
              department: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          shift: true,
        },
        orderBy: { date: 'desc' },
        skip,
        take,
      }),
      prisma.attendance.count({ where }),
    ]);

    return {
      data: attendances,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
      pages: Math.ceil(total / take),
    };
  },

  // ==================== HELPERS ====================

  /**
   * Chuyển đổi time object thành phút (tính từ 00:00)
   */
  convertTimeToMinutes(timeObj) {
    if (typeof timeObj === 'string') {
      const [hours, minutes] = timeObj.split(':').map(Number);
      return hours * 60 + minutes;
    }
    // Date object
    if (timeObj.getFullYear() === 1970) {
      // Shift time từ DB (UTC) - cần convert sang VN (+7 giờ)
      const utcHours = timeObj.getUTCHours();
      const utcMinutes = timeObj.getUTCMinutes();
      const vnHours = (utcHours + 7) % 24;
      return vnHours * 60 + utcMinutes;
    } else {
      // Current time - lấy local time (đã set TZ = Asia/Ho_Chi_Minh)
      const hours = timeObj.getHours();
      const minutes = timeObj.getMinutes();
      return hours * 60 + minutes;
    }
  },

  /**
   * Tính số phút làm việc giữa check-in và check-out
   */
  getWorkMinutes(checkInTime, checkOutTime) {
    const diffMs = checkOutTime - new Date(checkInTime);
    return Math.floor(diffMs / 60000); // Convert ms to minutes
  },

  /**
   * Format time for display
   */
  formatTime(date) {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  /**
   * Format date for display
   */
  formatDate(date) {
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  },

  /**
   * Update attendance record (HR/Admin only)
   */
  async updateAttendance(attendanceId, updates) {
    const attendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
      include: { shift: true },
    });

    if (!attendance) {
      throw new Error('Không tìm thấy bản ghi chấm công');
    }

    // Calculate work hours if both check-in and check-out are provided
    let workHours = updates.work_hours;
    if (updates.check_in && updates.check_out) {
      const checkInTime = new Date(updates.check_in);
      const checkOutTime = new Date(updates.check_out);
      const workMinutes = this.getWorkMinutes(checkInTime, checkOutTime);
      workHours = (workMinutes / 60).toFixed(2);
    }

    const updated = await prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        ...updates,
        work_hours: workHours,
        updated_at: new Date(),
      },
      include: {
        employee: {
          include: {
            department: true,
          },
        },
        shift: true,
      },
    });

    return updated;
  },

  /**
   * Calculate late/early minutes based on shift and check-in/out times
   */
  async calculateLateEarlyMinutes(shiftId, checkInTime, checkOutTime) {
    const shift = await this.getShiftById(shiftId);
    if (!shift) {
      throw new Error('Shift không tồn tại');
    }

    const shiftStart = this.convertTimeToMinutes(shift.start_time);
    const shiftEnd = this.convertTimeToMinutes(shift.end_time);

    let lateMinutes = 0;
    let earlyMinutes = 0;

    // Calculate late minutes
    if (checkInTime) {
      const checkInMinutes = this.convertTimeToMinutes(checkInTime);
      const gracePeriod = shiftStart + 15;

      if (checkInMinutes > gracePeriod) {
        lateMinutes = checkInMinutes - shiftStart;
      }
    }

    // Calculate early minutes (check-out too early)
    if (checkOutTime) {
      const checkOutMinutes = this.convertTimeToMinutes(checkOutTime);
      const maxEarlyCheckOut = shiftEnd - 15;

      if (checkOutMinutes < maxEarlyCheckOut) {
        earlyMinutes = shiftEnd - checkOutMinutes;
      }
    }

    return { lateMinutes, earlyMinutes };
  },

  /**
   * Delete attendance record (soft delete - HR/Admin only)
   */
  async deleteAttendance(attendanceId) {
    const attendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
    });

    if (!attendance) {
      throw new Error('Không tìm thấy bản ghi chấm công');
    }

    const deleted = await prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        is_deleted: true,
        deleted_at: new Date(),
      },
    });

    return deleted;
  },
};

export default attendanceService;
