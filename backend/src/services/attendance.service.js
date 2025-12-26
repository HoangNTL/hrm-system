import { prisma } from '../config/db.js';
import logger from '../utils/logger.js';

class AttendanceService {
  /**
   * Get shift by ID
   */
  async getShiftById(shiftId) {
    return prisma.shift.findUnique({
      where: { id: shiftId }
    });
  }

  /**
   * Get employee's current shift (mặc định shift đầu tiên, sau này có thể add shift_id vào employee)
   */
  async getEmployeeShift(employeeId) {
    // TODO: Sau này thêm shift_id vào employee model để liên kết
    // Tạm thời lấy shift đầu tiên
    const shift = await prisma.shift.findFirst({
      where: { is_deleted: false }
    });
    return shift;
  }

  /**
   * Validate check-in time
   * Returns: { valid: boolean, message: string, status: string }
   */
  validateCheckIn(shift, now, checkedInToday) {
    if (checkedInToday) {
      return {
        valid: false,
        message: 'Bạn đã check-in hôm nay rồi',
        status: 'already_checked_in'
      };
    }

    // Chuyển đổi time từ shift
    const shiftStart = this.convertTimeToMinutes(shift.start_time);
    const shiftEnd = this.convertTimeToMinutes(shift.end_time);
    const nowMinutes = this.convertTimeToMinutes(now);

    const earliestCheckIn = shiftStart - shift.early_check_in_minutes;
    const latestCheckIn = shiftStart + 30; // 30 phút buffer

    if (nowMinutes < earliestCheckIn) {
      const minutesLeft = earliestCheckIn - nowMinutes;
      return {
        valid: false,
        message: `Sớm quá. Bạn có thể check-in sau ${minutesLeft} phút`,
        status: 'too_early'
      };
    }

    if (nowMinutes > latestCheckIn) {
      return {
        valid: false,
        message: 'Quá muộn. Không thể check-in sau 08:30',
        status: 'too_late'
      };
    }

    // Kiểm tra có muộn không
    if (nowMinutes > shiftStart + 30) {
      const lateMinutes = nowMinutes - shiftStart;
      return {
        valid: true,
        message: `⚠️ Bạn đi trễ ${lateMinutes} phút`,
        status: 'late',
        isLate: true,
        lateMinutes
      };
    }

    return {
      valid: true,
      message: 'Check-in thành công',
      status: 'on_time'
    };
  }

  /**
   * Validate check-out time
   * Returns: { valid: boolean, message: string }
   */
  validateCheckOut(shift, checkInTime, now) {
    if (!checkInTime) {
      return {
        valid: false,
        message: 'Bạn chưa check-in. Vui lòng check-in trước'
      };
    }

    const shiftEnd = this.convertTimeToMinutes(shift.end_time);
    const nowMinutes = this.convertTimeToMinutes(now);

    const earliestCheckOut = shiftEnd - 30; // 30 phút sớm
    const latestCheckOut = shiftEnd + shift.late_checkout_minutes;

    if (nowMinutes < earliestCheckOut) {
      const minutesLeft = earliestCheckOut - nowMinutes;
      return {
        valid: false,
        message: `Chưa tới giờ tan ca. Hãy chờ thêm ${minutesLeft} phút`
      };
    }

    if (nowMinutes > latestCheckOut) {
      return {
        valid: false,
        message: 'Quá giờ check-out. Vui lòng check-out ngay'
      };
    }

    // Tính work minutes để trả về
    const workMinutes = this.getWorkMinutes(checkInTime, now);

    return {
      valid: true,
      message: 'Check-out thành công',
      workMinutes
    };
  }

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
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Kiểm tra đã check-in ca này hôm nay chưa
      const existingAttendance = await prisma.attendance.findUnique({
        where: {
          employee_id_date_shift_id: {
            employee_id: employeeId,
            date: today,
            shift_id: shiftId,
          }
        }
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
          }
        },
        update: {
          check_in: now,
          status: validation.isLate ? 'late' : 'present'
        },
        create: {
          employee_id: employeeId,
          shift_id: shiftId,
          date: today,
          check_in: now,
          status: validation.isLate ? 'late' : 'present'
        }
      });

      return {
        valid: true,
        message: `Check-in lúc ${this.formatTime(now)} ${validation.isLate ? '⚠️ (đi trễ)' : '✅'}`,
        status: validation.status,
        attendance
      };
    } catch (error) {
      logger.error('Check-in error:', error);
      return {
        valid: false,
        message: 'Lỗi khi check-in. Vui lòng thử lại',
        error: error.message
      };
    }
  }

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
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Lấy attendance của hôm nay
      const attendance = await prisma.attendance.findUnique({
        where: {
          employee_id_date_shift_id: {
            employee_id: employeeId,
            date: today,
            shift_id: shiftId,
          }
        }
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
          }
        },
        data: {
          check_out: now,
          work_hours: parseFloat(workHours)
        }
      });

      return {
        valid: true,
        message: `Check-out lúc ${this.formatTime(now)} ✅`,
        workHours,
        attendance: updatedAttendance
      };
    } catch (error) {
      logger.error('Check-out error:', error);
      return {
        valid: false,
        message: 'Lỗi khi check-out. Vui lòng thử lại',
        error: error.message
      };
    }
  }

  /**
   * Get today's attendance for employee
   */
  async getTodayAttendance(employeeId, shiftId = null) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
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
        check_in: 'desc'
      },
      include: {
        shift: true
      }
    });
  }

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
          lte: endDate
        },
        is_deleted: false
      }
    });

    const totalHours = attendances.reduce((sum, att) => {
      return sum + (att.work_hours || 0);
    }, 0);

    return {
      year,
      month,
      totalHours: parseFloat(totalHours.toFixed(2)),
      attendanceCount: attendances.length,
      attendances
    };
  }

  /**
   * Get attendance history for employee
   */
  async getAttendanceHistory(employeeId, fromDate, toDate) {
    return prisma.attendance.findMany({
      where: {
        employee_id: employeeId,
        date: {
          gte: fromDate,
          lte: toDate
        },
        is_deleted: false
      },
      include: {
        shift: true
      },
      orderBy: {
        date: 'desc'
      }
    });
  }

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
                  name: true
                }
              }
            }
          },
          shift: true
        },
        orderBy: { date: 'desc' },
        skip,
        take
      }),
      prisma.attendance.count({ where })
    ]);

    return {
      data: attendances,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
      pages: Math.ceil(total / take)
    };
  }

  // ==================== HELPERS ====================

  /**
   * Chuyển đổi time object thành phút (tính từ 00:00)
   */
  convertTimeToMinutes(timeObj) {
    if (typeof timeObj === 'string') {
      const [hours, minutes] = timeObj.split(':').map(Number);
      return hours * 60 + minutes;
    }
    // Nếu là Date object (PostgreSQL Time type)
    // Extract UTC time from ISO string to avoid timezone conversion
    const isoString = timeObj.toISOString(); // "1970-01-01T15:00:00.000Z"
    const timeStr = isoString.split('T')[1]; // "15:00:00.000Z"
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Tính số phút làm việc giữa check-in và check-out
   */
  getWorkMinutes(checkInTime, checkOutTime) {
    const diffMs = checkOutTime - new Date(checkInTime);
    return Math.floor(diffMs / 60000); // Convert ms to minutes
  }

  /**
   * Format time for display
   */
  formatTime(date) {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Format date for display
   */
  formatDate(date) {
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }
}

export default new AttendanceService();
