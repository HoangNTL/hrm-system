import attendanceService from '../services/attendance.service.js';
import logger from '../utils/logger.js';
import { prisma } from '../config/db.js';

class AttendanceController {
  /**
   * Get all shifts
   */
  async getShifts(req, res) {
    try {
      const shifts = await prisma.shift.findMany({
        where: { is_deleted: false }
      });

      return res.status(200).json({
        success: true,
        data: shifts
      });
    } catch (error) {
      logger.error('Get shifts error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách ca làm việc',
        error: error.message
      });
    }
  }

  /**
   * Check-in
   */
  async checkIn(req, res) {
    try {
      const employeeId = req.body.employeeId || req.user.employee_id;
      const { shiftId } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Validate input
      if (!employeeId || !shiftId) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp employeeId và shiftId'
        });
      }

      // STAFF chỉ có thể check-in cho chính mình
      if (userRole === 'STAFF' && parseInt(employeeId) !== req.user.employee_id) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền check-in cho nhân viên khác'
        });
      }

      const result = await attendanceService.checkIn(employeeId, shiftId);

      if (!result.valid) {
        return res.status(400).json({
          success: false,
          message: result.message,
          status: result.status
        });
      }

      logger.info(`Employee ${employeeId} checked in at ${new Date().toISOString()}`);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: {
          status: result.status,
          checkInTime: result.attendance?.check_in,
          isLate: result.status === 'late'
        }
      });
    } catch (error) {
      logger.error('Check-in error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi check-in',
        error: error.message
      });
    }
  }

  /**
   * Check-out
   */
  async checkOut(req, res) {
    try {
      const employeeId = req.body.employeeId || req.user.employee_id;
      const { shiftId } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Validate input
      if (!employeeId || !shiftId) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp employeeId và shiftId'
        });
      }

      // STAFF chỉ có thể check-out cho chính mình
      if (userRole === 'STAFF' && parseInt(employeeId) !== req.user.employee_id) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền check-out cho nhân viên khác'
        });
      }

      const result = await attendanceService.checkOut(employeeId, shiftId);

      if (!result.valid) {
        return res.status(400).json({
          success: false,
          message: result.message
        });
      }

      logger.info(`Employee ${employeeId} checked out at ${new Date().toISOString()}`);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: {
          checkOutTime: result.attendance?.check_out,
          workHours: result.workHours
        }
      });
    } catch (error) {
      logger.error('Check-out error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi check-out',
        error: error.message
      });
    }
  }

  /**
   * Get today's attendance status
   */
  async getTodayStatus(req, res) {
    try {
      const employeeId = req.params.employeeId || req.user.employee_id;
      const shiftId = req.query.shiftId ? parseInt(req.query.shiftId) : null;
      const userId = req.user.id;
      const userRole = req.user.role;

      // STAFF chỉ có thể xem của chính mình
      if (userRole === 'STAFF' && parseInt(employeeId) !== req.user.employee_id) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền xem thông tin này'
        });
      }

      const attendance = await attendanceService.getTodayAttendance(employeeId, shiftId);
      const shift = attendance?.shift || await attendanceService.getEmployeeShift(employeeId, shiftId);

      const now = new Date();
      let nextAction = null;
      let canCheckIn = false;
      let canCheckOut = false;
      let message = '';

      if (shift) {
        if (!attendance?.check_in) {
          const checkInValidation = attendanceService.validateCheckIn(shift, now, false);
          canCheckIn = checkInValidation.valid;
          if (canCheckIn) {
            nextAction = 'CHECK_IN';
            message = 'Sẵn sàng check-in';
          } else {
            message = checkInValidation.message;
          }
        } else if (!attendance?.check_out) {
          const checkOutValidation = attendanceService.validateCheckOut(
            shift,
            attendance.check_in,
            now
          );
          canCheckOut = checkOutValidation.valid;
          if (canCheckOut) {
            nextAction = 'CHECK_OUT';
            message = 'Sẵn sàng check-out';
          } else {
            message = checkOutValidation.message;
          }
        } else {
          nextAction = 'COMPLETED';
          message = 'Đã hoàn thành hôm nay';
        }
      }

      return res.status(200).json({
        success: true,
        data: {
          attendance,
          shift,
          currentTime: now,
          nextAction,
          canCheckIn,
          canCheckOut,
          message
        }
      });
    } catch (error) {
      logger.error('Get today status error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thông tin',
        error: error.message
      });
    }
  }

  /**
   * Get monthly work hours
   */
  async getMonthlyHours(req, res) {
    try {
      const employeeId = req.params.employeeId || req.user.employee_id;
      const { year, month } = req.query;
      const userId = req.user.id;
      const userRole = req.user.role;

      // STAFF chỉ có thể xem của chính mình
      if (userRole === 'STAFF' && parseInt(employeeId) !== req.user.employee_id) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền xem thông tin này'
        });
      }

      const now = new Date();
      const queryYear = parseInt(year) || now.getFullYear();
      const queryMonth = parseInt(month) || now.getMonth() + 1;

      const result = await attendanceService.getMonthlyWorkHours(
        parseInt(employeeId),
        queryYear,
        queryMonth
      );

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get monthly hours error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thông tin',
        error: error.message
      });
    }
  }

  /**
   * Get attendance history
   */
  async getHistory(req, res) {
    try {
      const employeeId = req.params.employeeId || req.user.employee_id;
      const { fromDate, toDate } = req.query;
      const userId = req.user.id;
      const userRole = req.user.role;

      // STAFF chỉ có thể xem của chính mình
      if (userRole === 'STAFF' && parseInt(employeeId) !== req.user.employee_id) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền xem thông tin này'
        });
      }

      const from = new Date(fromDate || new Date().getFullYear() + '-01-01');
      const to = new Date(toDate || new Date());

      const attendances = await attendanceService.getAttendanceHistory(
        parseInt(employeeId),
        from,
        to
      );

      return res.status(200).json({
        success: true,
        data: attendances
      });
    } catch (error) {
      logger.error('Get history error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thông tin',
        error: error.message
      });
    }
  }

  /**
   * Get all attendances (HR/Admin)
   */
  async getAll(req, res) {
    try {
      const { employeeId, fromDate, toDate, status, page = 1, limit = 10 } = req.query;

      const filters = {
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      };

      if (employeeId) filters.employeeId = parseInt(employeeId);
      if (status) filters.status = status;
      if (fromDate) filters.fromDate = new Date(fromDate);
      if (toDate) filters.toDate = new Date(toDate);

      const result = await attendanceService.getAllAttendances(filters);

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get all attendances error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thông tin',
        error: error.message
      });
    }
  }
}

export default new AttendanceController();
