import logger from '../../shared/utils/logger.js';
import { ErrorMessages } from '../../utils/errorMessages.js';
import { UserRole } from '../../shared/constants/roles.js';
import attendanceService from './attendance.service.js';

export const attendanceController = {
  async getShifts(req, res) {
    try {
      const shifts = await attendanceService.getShifts();

      return res.status(200).json({
        success: true,
        data: shifts,
      });
    } catch (error) {
      logger.error('Get shifts error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách ca làm việc',
        error: error.message,
      });
    }
  },

  async checkIn(req, res) {
    try {
      const employeeId = req.validated?.checkActionBody?.employeeId || req.user.employee_id;
      const { shiftId } = req.validated?.checkActionBody || {};
      const userRole = req.user.role;

      if (!employeeId || !shiftId) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp employeeId và shiftId',
        });
      }

      if (userRole === UserRole.STAFF && parseInt(employeeId, 10) !== req.user.employee_id) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền check-in cho nhân viên khác',
        });
      }

      const result = await attendanceService.checkIn(employeeId, shiftId);

      if (!result.valid) {
        return res.status(400).json({
          success: false,
          message: result.message,
          status: result.status,
        });
      }

      logger.info(`Employee ${employeeId} checked in at ${new Date().toISOString()}`);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: {
          status: result.status,
          checkInTime: result.attendance?.check_in,
          isLate: result.status === 'late',
        },
      });
    } catch (error) {
      logger.error('Check-in error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi check-in',
        error: error.message,
      });
    }
  },

  async checkOut(req, res) {
    try {
      const employeeId = req.validated?.checkActionBody?.employeeId || req.user.employee_id;
      const { shiftId } = req.validated?.checkActionBody || {};
      const userRole = req.user.role;

      if (!employeeId || !shiftId) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp employeeId và shiftId',
        });
      }

      if (userRole === UserRole.STAFF && parseInt(employeeId, 10) !== req.user.employee_id) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền check-out cho nhân viên khác',
        });
      }

      const result = await attendanceService.checkOut(employeeId, shiftId);

      if (!result.valid) {
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }

      logger.info(`Employee ${employeeId} checked out at ${new Date().toISOString()}`);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: {
          checkOutTime: result.attendance?.check_out,
          workHours: result.workHours,
        },
      });
    } catch (error) {
      logger.error('Check-out error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi check-out',
        error: error.message,
      });
    }
  },

  async getTodayStatus(req, res) {
    try {
      const employeeId = req.validated?.todayQuery?.employeeId || req.user.employee_id;
      const shiftId = req.validated?.todayQuery?.shiftId || null;
      const userRole = req.user.role;

      if (userRole === UserRole.STAFF && parseInt(employeeId, 10) !== req.user.employee_id) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền xem thông tin này',
        });
      }

      const attendance = await attendanceService.getTodayAttendance(employeeId, shiftId);
      const shift = attendance?.shift || (await attendanceService.getEmployeeShift(employeeId, shiftId));

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
            now,
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
          message,
        },
      });
    } catch (error) {
      logger.error('Get today status error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thông tin',
        error: error.message,
      });
    }
  },

  async getMonthlyHours(req, res) {
    try {
      const employeeId = req.user.employee_id;
      const { year, month } = req.validated?.monthlyQuery || {};

      if (!employeeId) {
        return res.status(400).json({
          success: false,
          message: 'User không có employee_id',
        });
      }

      const now = new Date();
      const queryYear = parseInt(year, 10) || now.getFullYear();
      const queryMonth = parseInt(month, 10) || now.getMonth() + 1;

      const result = await attendanceService.getMonthlyWorkHours(
        parseInt(employeeId, 10),
        queryYear,
        queryMonth,
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Get monthly hours error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thông tin',
        error: error.message,
      });
    }
  },

  async getHistory(req, res) {
    try {
      const employeeId = req.user.employee_id;
      const { fromDate, toDate } = req.validated?.historyQuery || {};

      if (!employeeId) {
        return res.status(400).json({
          success: false,
          message: 'User không có employee_id',
        });
      }

      const from = fromDate || new Date(`${new Date().getFullYear()}-01-01`);
      const to = toDate || new Date();

      const attendances = await attendanceService.getAttendanceHistory(
        parseInt(employeeId, 10),
        from,
        to,
      );

      return res.status(200).json({
        success: true,
        data: attendances,
      });
    } catch (error) {
      logger.error('Get history error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thông tin',
        error: error.message,
      });
    }
  },

  async getAll(req, res) {
    try {
      const { employeeId, fromDate, toDate, status, page, limit } = req.validated?.listQuery || {};

      const filters = {
        skip: (parseInt(page, 10) - 1) * parseInt(limit, 10),
        take: parseInt(limit, 10),
      };

      if (employeeId) filters.employeeId = employeeId;
      if (status) filters.status = status;
      if (fromDate) filters.fromDate = fromDate;
      if (toDate) filters.toDate = toDate;

      const result = await attendanceService.getAllAttendances(filters);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Get all attendances error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thông tin',
        error: error.message,
      });
    }
  },

  async update(req, res) {
    try {
      const attendanceId = req.validated?.attendanceId;
      const updates = req.validated?.updateBody || req.body;

      if (!attendanceId) {
        return res.status(400).json({
          success: false,
          message: 'ID chấm công không hợp lệ',
        });
      }

      const updated = await attendanceService.updateAttendance(attendanceId, updates);

      logger.info(`Attendance ${attendanceId} updated by user ${req.user.id}`);

      return res.status(200).json({
        success: true,
        message: 'Cập nhật chấm công thành công',
        data: updated,
      });
    } catch (error) {
      logger.error('Update attendance error:', error);
      return res.status(500).json({
        success: false,
        message: ErrorMessages.ATTENDANCE.UPDATE_FAILED,
      });
    }
  },

  async remove(req, res) {
    try {
      const attendanceId = req.validated?.attendanceId;

      if (!attendanceId) {
        return res.status(400).json({
          success: false,
          message: 'ID chấm công không hợp lệ',
        });
      }

      await attendanceService.deleteAttendance(attendanceId);

      logger.info(`Attendance ${attendanceId} deleted by user ${req.user.id}`);

      return res.status(200).json({
        success: true,
        message: 'Xóa bản ghi chấm công thành công',
      });
    } catch (error) {
      logger.error('Delete attendance error:', error);
      return res.status(500).json({
        success: false,
        message: ErrorMessages.ATTENDANCE.DELETE_FAILED,
      });
    }
  },
};

export const {
  checkIn,
  checkOut,
  getAll,
  getHistory,
  getMonthlyHours,
  getShifts,
  getTodayStatus,
  remove,
  update,
} = attendanceController;
