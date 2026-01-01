import { prisma } from '../config/db.js';
import ApiError from '../utils/ApiError.js';
import response from '../utils/response.js';
import attendanceService from '../services/attendance.service.js';

// Nhân viên tạo đơn xin sửa chấm công
export const createRequest = async (req, res, next) => {
  try {
    const { attendanceId, requestType, reason, newCheckIn, newCheckOut, requestedDate } = req.body;
    let employeeId = req.user.employee_id;

    // Fallback: nếu token không có employee_id, lấy từ user table
    if (!employeeId && req.user?.id) {
      const userRecord = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { employee_id: true },
      });
      employeeId = userRecord?.employee_id || null;
    }

    if (!employeeId) {
      throw new ApiError(400, 'Không tìm thấy employee_id cho user');
    }

    if (!employeeId) {
      throw new ApiError(400, 'User không có employee record');
    }

    if (!requestType || !reason) {
      throw new ApiError(400, 'requestType và reason là bắt buộc');
    }

    // Nếu là forgot_checkout, cần attendance_id hoặc newCheckOut
    if (requestType === 'forgot_checkout' && !attendanceId && !newCheckOut) {
      throw new ApiError(400, 'Cho xin xin checkout cần attendance_id hoặc newCheckOut');
    }

    const createData = {
      employee_id: employeeId,
      attendance_id: attendanceId || null,
      request_type: requestType,
      reason,
      requested_date: requestedDate ? new Date(requestedDate) : new Date(),
      new_check_in: newCheckIn ? new Date(newCheckIn) : null,
      new_check_out: newCheckOut ? new Date(newCheckOut) : null,
      status: 'pending',
    };

    console.log('Create AttendanceRequest payload:', createData);

    const request = await prisma.attendanceRequest.create({
      data: createData,
      include: {
        employee: {
          select: { id: true, full_name: true, email: true },
        },
      },
    });

    response.success(res, request, 'Tạo đơn xin sửa chấm công thành công');
  } catch (error) {
    console.error('Create attendance request error:', error);
    next(error);
  }
};

// Nhân viên xem danh sách đơn của mình
export const getMyRequests = async (req, res, next) => {
  try {
    let employeeId = req.user.employee_id;

    // Fallback: nếu token không có employee_id, lấy từ user table
    if (!employeeId && req.user?.id) {
      const userRecord = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { employee_id: true },
      });
      employeeId = userRecord?.employee_id || null;
    }

    if (!employeeId) {
      throw new ApiError(400, 'User không có employee record');
    }

    const { status, page = 1, limit = 10 } = req.query;
    const filter = { employee_id: employeeId, is_deleted: false };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [requests, total] = await Promise.all([
      prisma.attendanceRequest.findMany({
        where: filter,
        include: {
          employee: { select: { full_name: true, email: true } },
          reviewer: { select: { email: true } },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.attendanceRequest.count({ where: filter }),
    ]);

    console.log(`[getMyRequests] employeeId: ${employeeId}, filter:`, filter, 'found:', requests.length);
    response.success(res, { requests, total, page: parseInt(page), limit: parseInt(limit) }, 'Lấy danh sách đơn thành công');
  } catch (error) {
    console.error('[getMyRequests] Error:', error);
    next(error);
  }
};

// HR/Admin xem tất cả đơn
export const getAllRequests = async (req, res, next) => {
  try {
    const { status = 'pending', page = 1, limit = 10, employeeName } = req.query;

    const filter = { is_deleted: false };
    if (status) filter.status = status;
    if (employeeName) {
      filter.employee = { full_name: { contains: employeeName, mode: 'insensitive' } };
    }

    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      prisma.attendanceRequest.findMany({
        where: filter,
        include: {
          employee: { select: { id: true, full_name: true, email: true, department: true } },
          reviewer: { select: { email: true } },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.attendanceRequest.count({ where: filter }),
    ]);

    response.success(res, { requests, total, page: parseInt(page), limit: parseInt(limit) }, 'Lấy tất cả đơn thành công');
  } catch (error) {
    next(error);
  }
};

// HR/Admin duyệt đơn
export const approveRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const reviewerId = req.user.id;

    console.log('=== APPROVE REQUEST ===');
    console.log('Request ID:', id);
    console.log('Reviewer ID:', reviewerId);

    const request = await prisma.attendanceRequest.findUnique({
      where: { id: parseInt(id) },
      include: { employee: true },
    });

    console.log('Request found:', request);

    if (!request) {
      throw new ApiError(404, 'Không tìm thấy đơn');
    }

    if (request.status !== 'pending') {
      throw new ApiError(400, 'Đơn này không ở trạng thái pending');
    }

    // Xử lý cập nhật/tạo attendance khi duyệt
    if (request.new_check_in || request.new_check_out) {
      console.log('Processing attendance update/create...');
      console.log('attendance_id:', request.attendance_id);
      console.log('new_check_in:', request.new_check_in);
      console.log('new_check_out:', request.new_check_out);
      console.log('request:', JSON.stringify(request, null, 2));
      
      if (request.attendance_id) {
        // Cập nhật attendance record nếu đã tồn tại
        console.log('UPDATING existing attendance record...');
        const updateData = {};
        if (request.new_check_in) updateData.check_in = request.new_check_in;
        if (request.new_check_out) updateData.check_out = request.new_check_out;

        if (Object.keys(updateData).length > 0) {
          // Lấy shift info để tính late/early
          const attendance = await prisma.attendance.findUnique({
            where: { id: request.attendance_id },
            include: { shift: true }
          });

          if (attendance?.shift) {
            const { lateMinutes, earlyMinutes } = await attendanceService.calculateLateEarlyMinutes(
              attendance.shift_id,
              updateData.check_in || attendance.check_in,
              updateData.check_out || attendance.check_out
            );
            updateData.late_minutes = lateMinutes;
            updateData.early_minutes = earlyMinutes;

            // Tính lại work_hours nếu có check_in và check_out
            if (updateData.check_in && updateData.check_out) {
              const checkInTime = new Date(updateData.check_in);
              const checkOutTime = new Date(updateData.check_out);
              const workMinutes = (checkOutTime - checkInTime) / (1000 * 60);
              updateData.work_hours = parseFloat((workMinutes / 60).toFixed(2));
            } else if (updateData.check_out && attendance.check_in) {
              const checkInTime = new Date(attendance.check_in);
              const checkOutTime = new Date(updateData.check_out);
              const workMinutes = (checkOutTime - checkInTime) / (1000 * 60);
              updateData.work_hours = parseFloat((workMinutes / 60).toFixed(2));
            }
          }

          console.log('Updating attendance with data:', JSON.stringify(updateData, null, 2));

          const updatedAtt = await prisma.attendance.update({
            where: { id: request.attendance_id },
            data: updateData,
          });
          
          console.log('Attendance updated successfully:', JSON.stringify(updatedAtt, null, 2));
        }
      } else {
        // Tạo hoặc update attendance record nếu chưa có/đã có (forgot_checkout case)
        console.log('CREATING/UPDATING attendance via upsert (no attendance_id)...');
        const requestedDate = new Date(request.requested_date);
        // Set time at noon to match check-in/check-out logic
        const attendanceDate = new Date(requestedDate.getFullYear(), requestedDate.getMonth(), requestedDate.getDate(), 12, 0, 0, 0);
        console.log('Creating/updating attendance for date:', attendanceDate);
        
        const [shift] = await prisma.shift.findMany({
          where: { is_deleted: false },
          take: 1,
        });

        console.log('Using shift:', shift);

        if (shift) {
          // Tính late/early minutes cho record
          const { lateMinutes, earlyMinutes } = await attendanceService.calculateLateEarlyMinutes(
            shift.id,
            request.new_check_in,
            request.new_check_out
          );

          console.log('Calculated late/early:', { lateMinutes, earlyMinutes });

          // Tính work_hours nếu có cả check_in và check_out
          let workHours = null;
          if (request.new_check_in && request.new_check_out) {
            const checkInTime = new Date(request.new_check_in);
            const checkOutTime = new Date(request.new_check_out);
            const workMinutes = (checkOutTime - checkInTime) / (1000 * 60);
            workHours = parseFloat((workMinutes / 60).toFixed(2));
            console.log('Calculated work hours (both new):', { checkInTime, checkOutTime, workMinutes, workHours });
          } else if (request.new_check_out) {
            // Nếu chỉ có new_check_out (forgot_checkout case), cần lấy check_in từ attendance hiện có
            // Đầu tiên, fetch attendance record từ requested_date
            const attendanceDate = new Date(request.requested_date.getFullYear(), request.requested_date.getMonth(), request.requested_date.getDate(), 12, 0, 0, 0);
            const existingAttendance = await prisma.attendance.findFirst({
              where: {
                employee_id: request.employee_id,
                date: attendanceDate,
              }
            });

            if (existingAttendance && existingAttendance.check_in) {
              const checkInTime = new Date(existingAttendance.check_in);
              const checkOutTime = new Date(request.new_check_out);
              const workMinutes = (checkOutTime - checkInTime) / (1000 * 60);
              workHours = parseFloat((workMinutes / 60).toFixed(2));
              console.log('Calculated work hours (using existing check_in):', { checkInTime, checkOutTime, workMinutes, workHours });
            } else {
              console.log('Cannot calculate work_hours - no existing check_in found');
            }
          } else if (request.new_check_in) {
            // Nếu chỉ có new_check_in (forgot_checkin case), lấy check_out từ record hiện có
            const attendanceDate = new Date(request.requested_date.getFullYear(), request.requested_date.getMonth(), request.requested_date.getDate(), 12, 0, 0, 0);
            const existingAttendance = await prisma.attendance.findFirst({
              where: {
                employee_id: request.employee_id,
                date: attendanceDate,
              }
            });

            if (existingAttendance && existingAttendance.check_out) {
              const checkInTime = new Date(request.new_check_in);
              const checkOutTime = new Date(existingAttendance.check_out);
              const workMinutes = (checkOutTime - checkInTime) / (1000 * 60);
              workHours = parseFloat((workMinutes / 60).toFixed(2));
              console.log('Calculated work hours (using existing check_out):', { checkInTime, checkOutTime, workMinutes, workHours });
            } else {
              console.log('Cannot calculate work_hours - no existing check_out found');
            }
          }

          // Dùng upsert để tránh conflict
          const newAttendance = await prisma.attendance.upsert({
            where: {
              employee_id_date_shift_id: {
                employee_id: request.employee_id,
                date: attendanceDate,
                shift_id: shift.id,
              }
            },
            update: {
              check_in: request.new_check_in || undefined,
              check_out: request.new_check_out || undefined,
              status: 'present',
              late_minutes: lateMinutes,
              early_minutes: earlyMinutes,
              work_hours: workHours,
            },
            create: {
              employee_id: request.employee_id,
              shift_id: shift.id,
              date: attendanceDate,
              check_in: request.new_check_in || null,
              check_out: request.new_check_out || null,
              status: 'present',
              late_minutes: lateMinutes,
              early_minutes: earlyMinutes,
              work_hours: workHours,
            },
          });
          
          console.log('Attendance created/updated:', newAttendance);
        }
      }
    }

    const approvedRequest = await prisma.attendanceRequest.update({
      where: { id: parseInt(id) },
      data: {
        status: 'approved',
        reviewed_by: reviewerId,
        reviewed_at: new Date(),
        notes,
      },
      include: {
        employee: { select: { full_name: true, email: true } },
        reviewer: { select: { email: true } },
      },
    });

    response.success(res, approvedRequest, 'Duyệt đơn thành công');
  } catch (error) {
    next(error);
  }
};

// HR/Admin từ chối đơn
export const rejectRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const reviewerId = req.user.id;

    const request = await prisma.attendanceRequest.findUnique({
      where: { id: parseInt(id) },
    });

    if (!request) {
      throw new ApiError(404, 'Không tìm thấy đơn');
    }

    if (request.status !== 'pending') {
      throw new ApiError(400, 'Đơn này không ở trạng thái pending');
    }

    const rejectedRequest = await prisma.attendanceRequest.update({
      where: { id: parseInt(id) },
      data: {
        status: 'rejected',
        reviewed_by: reviewerId,
        reviewed_at: new Date(),
        notes,
      },
      include: {
        employee: { select: { full_name: true, email: true } },
        reviewer: { select: { email: true } },
      },
    });

    response.success(res, rejectedRequest, 'Từ chối đơn thành công');
  } catch (error) {
    next(error);
  }
};

// Chi tiết một đơn
export const getRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const request = await prisma.attendanceRequest.findUnique({
      where: { id: parseInt(id) },
      include: {
        employee: { select: { full_name: true, email: true } },
        reviewer: { select: { email: true } },
      },
    });

    if (!request) {
      throw new ApiError(404, 'Không tìm thấy đơn');
    }

    response.success(res, request, 'Lấy chi tiết đơn thành công');
  } catch (error) {
    next(error);
  };
};

