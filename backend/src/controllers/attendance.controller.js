import attendanceService from '../services/attendance.service.js';
import logger from '../utils/logger.js';
import { prisma } from '../config/db.js';

// Convert to function-based handlers with named exports
export const getShifts = async (req, res) => {
  try {
    const shifts = await prisma.shift.findMany({
      where: { is_deleted: false },
    });

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
};

export const checkIn = async (req, res) => {
  try {
    const employeeId = req.body.employeeId || req.user.employee_id;
    const { shiftId } = req.body;
    const userRole = req.user.role;

    if (!employeeId || !shiftId) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp employeeId và shiftId',
      });
    }

    if (userRole === 'STAFF' && parseInt(employeeId) !== req.user.employee_id) {
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
};

export const checkOut = async (req, res) => {
  try {
    const employeeId = req.body.employeeId || req.user.employee_id;
    const { shiftId } = req.body;
    const userRole = req.user.role;

    if (!employeeId || !shiftId) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp employeeId và shiftId',
      });
    }

    if (userRole === 'STAFF' && parseInt(employeeId) !== req.user.employee_id) {
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
};

export const getTodayStatus = async (req, res) => {
  try {
    const employeeId = req.params.employeeId || req.user.employee_id;
    const shiftId = req.query.shiftId ? parseInt(req.query.shiftId) : null;
    const userRole = req.user.role;

    if (userRole === 'STAFF' && parseInt(employeeId) !== req.user.employee_id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem thông tin này',
      });
    }

    const attendance = await attendanceService.getTodayAttendance(employeeId, shiftId);
    const shift =
      attendance?.shift || (await attendanceService.getEmployeeShift(employeeId, shiftId));

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
};

export const getMonthlyHours = async (req, res) => {
  try {
    const employeeId = req.user.employee_id;
    const { year, month } = req.query;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'User không có employee_id',
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
};

export const getHistory = async (req, res) => {
  try {
    const employeeId = req.user.employee_id;
    const { fromDate, toDate } = req.query;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'User không có employee_id',
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
};

export const getAll = async (req, res) => {
  try {
    const { employeeId, fromDate, toDate, status, page = 1, limit = 10 } = req.query;

    const filters = {
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
    };

    if (employeeId) filters.employeeId = parseInt(employeeId);
    if (status) filters.status = status;
    if (fromDate) filters.fromDate = new Date(fromDate);
    if (toDate) filters.toDate = new Date(toDate);

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
};

export const update = async (req, res) => {
  try {
    const attendanceId = parseInt(req.params.id);
    const updates = req.body;

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
      message: error.message || 'Lỗi khi cập nhật chấm công',
      error: error.message,
    });
  }
};

export const remove = async (req, res) => {
  try {
    const attendanceId = parseInt(req.params.id);

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
      message: error.message || 'Lỗi khi xóa bản ghi chấm công',
      error: error.message,
    });
  }
};
