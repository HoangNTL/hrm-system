import ApiError from '../../utils/ApiError.js';
import attendanceService from '../attendance/attendance.service.js';
import { HR_ADMIN_ROLES } from '../../shared/constants/roles.js';

import { attendanceRequestRepository } from './attendanceRequest.repository.js';

async function resolveEmployeeIdFromUser(user) {
  let employeeId = user?.employee_id;

  if (!employeeId && user?.id) {
    const userRecord = await attendanceRequestRepository.findUserEmployeeId(user.id);
    employeeId = userRecord?.employee_id || null;
  }

  return employeeId;
}

function buildApprovalPayload(lateMinutes, earlyMinutes, workHours, checkIn, checkOut) {
  return {
    check_in: checkIn || undefined,
    check_out: checkOut || undefined,
    status: 'present',
    late_minutes: lateMinutes,
    early_minutes: earlyMinutes,
    work_hours: workHours,
  };
}

export const attendanceRequestService = {
  async create(body, user) {
    const {
      attendanceId,
      requestType,
      reason,
      newCheckIn,
      newCheckOut,
      requestedDate,
    } = body;
    const employeeId = await resolveEmployeeIdFromUser(user);

    if (!employeeId) {
      throw new ApiError(400, 'Không tìm thấy employee_id cho user');
    }

    if (!requestType || !reason) {
      throw new ApiError(400, 'requestType và reason là bắt buộc');
    }

    if (requestType === 'forgot_checkout' && !attendanceId && !newCheckOut) {
      throw new ApiError(400, 'Cho xin xin checkout cần attendance_id hoặc newCheckOut');
    }

    return attendanceRequestRepository.createRequest({
      employee_id: employeeId,
      attendance_id: attendanceId || null,
      request_type: requestType,
      reason,
      requested_date: requestedDate ? new Date(requestedDate) : new Date(),
      new_check_in: newCheckIn ? new Date(newCheckIn) : null,
      new_check_out: newCheckOut ? new Date(newCheckOut) : null,
      status: 'pending',
    });
  },

  async getMine(query, user) {
    const employeeId = await resolveEmployeeIdFromUser(user);

    if (!employeeId) {
      throw new ApiError(400, 'User không có employee record');
    }

    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const filter = { employee_id: employeeId, is_deleted: false };
    if (query.status) filter.status = query.status;

    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      attendanceRequestRepository.findMyRequests(filter, skip, limit),
      attendanceRequestRepository.countRequests(filter),
    ]);

    return { requests, total, page, limit };
  },

  async getAll(query) {
    const status = query.status === undefined ? 'pending' : query.status;
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const filter = { is_deleted: false };

    if (status) filter.status = status;
    if (query.employeeName) {
      filter.employee = {
        full_name: { contains: query.employeeName, mode: 'insensitive' },
      };
    }

    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      attendanceRequestRepository.findAllRequests(filter, skip, limit),
      attendanceRequestRepository.countRequests(filter),
    ]);

    return { requests, total, page, limit };
  },

  async approve(id, notes, reviewerId) {
    const request = await attendanceRequestRepository.findRequestForApproval(id);

    if (!request || request.is_deleted) {
      throw new ApiError(404, 'Không tìm thấy đơn');
    }

    if (request.status !== 'pending') {
      throw new ApiError(400, 'Đơn này không ở trạng thái pending');
    }

    if (request.new_check_in || request.new_check_out) {
      if (request.attendance_id) {
        const updateData = {};
        if (request.new_check_in) updateData.check_in = request.new_check_in;
        if (request.new_check_out) updateData.check_out = request.new_check_out;

        if (Object.keys(updateData).length > 0) {
          const attendance = await attendanceRequestRepository.findAttendanceById(request.attendance_id);

          if (!attendance || attendance.is_deleted) {
            throw new ApiError(404, 'Không tìm thấy bản ghi chấm công');
          }

          if (attendance.shift) {
            const { lateMinutes, earlyMinutes } =
              await attendanceService.calculateLateEarlyMinutes(
                attendance.shift_id,
                updateData.check_in || attendance.check_in,
                updateData.check_out || attendance.check_out,
              );

            updateData.late_minutes = lateMinutes;
            updateData.early_minutes = earlyMinutes;

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

          await attendanceRequestRepository.updateAttendanceById(request.attendance_id, updateData);
        }
      } else {
        const requestedDate = new Date(request.requested_date);
        const attendanceDate = new Date(
          requestedDate.getFullYear(),
          requestedDate.getMonth(),
          requestedDate.getDate(),
          12,
          0,
          0,
          0,
        );

        const [shift] = await attendanceRequestRepository.findFirstActiveShift();

        if (shift) {
          const { lateMinutes, earlyMinutes } =
            await attendanceService.calculateLateEarlyMinutes(
              shift.id,
              request.new_check_in,
              request.new_check_out,
            );

          let workHours = null;
          if (request.new_check_in && request.new_check_out) {
            const checkInTime = new Date(request.new_check_in);
            const checkOutTime = new Date(request.new_check_out);
            const workMinutes = (checkOutTime - checkInTime) / (1000 * 60);
            workHours = parseFloat((workMinutes / 60).toFixed(2));
          } else if (request.new_check_out) {
            const existingAttendance =
              await attendanceRequestRepository.findExistingAttendanceByEmployeeDate(
                request.employee_id,
                attendanceDate,
              );

            if (existingAttendance?.check_in) {
              const checkInTime = new Date(existingAttendance.check_in);
              const checkOutTime = new Date(request.new_check_out);
              const workMinutes = (checkOutTime - checkInTime) / (1000 * 60);
              workHours = parseFloat((workMinutes / 60).toFixed(2));
            }
          } else if (request.new_check_in) {
            const existingAttendance =
              await attendanceRequestRepository.findExistingAttendanceByEmployeeDate(
                request.employee_id,
                attendanceDate,
              );

            if (existingAttendance?.check_out) {
              const checkInTime = new Date(request.new_check_in);
              const checkOutTime = new Date(existingAttendance.check_out);
              const workMinutes = (checkOutTime - checkInTime) / (1000 * 60);
              workHours = parseFloat((workMinutes / 60).toFixed(2));
            }
          }

          await attendanceRequestRepository.upsertAttendance(
            request.employee_id,
            attendanceDate,
            shift.id,
            buildApprovalPayload(
              lateMinutes,
              earlyMinutes,
              workHours,
              request.new_check_in,
              request.new_check_out,
            ),
            {
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
          );
        }
      }
    }

    return attendanceRequestRepository.updateRequestStatus(id, {
      status: 'approved',
      reviewed_by: reviewerId,
      reviewed_at: new Date(),
      notes,
    });
  },

  async reject(id, notes, reviewerId) {
    const request = await attendanceRequestRepository.findRequestForApproval(id);

    if (!request || request.is_deleted) {
      throw new ApiError(404, 'Không tìm thấy đơn');
    }

    if (request.status !== 'pending') {
      throw new ApiError(400, 'Đơn này không ở trạng thái pending');
    }

    return attendanceRequestRepository.updateRequestStatus(id, {
      status: 'rejected',
      reviewed_by: reviewerId,
      reviewed_at: new Date(),
      notes,
    });
  },

  async getById(id, user) {
    const request = await attendanceRequestRepository.findRequestDetail(id);

    if (!request || request.is_deleted) {
      throw new ApiError(404, 'Không tìm thấy đơn');
    }

    const isPrivilegedUser = HR_ADMIN_ROLES.includes(user?.role);
    if (!isPrivilegedUser) {
      const employeeId = await resolveEmployeeIdFromUser(user);

      if (!employeeId) {
        throw new ApiError(401, 'Unauthorized');
      }

      if (request.employee_id !== employeeId) {
        throw new ApiError(403, 'Bạn không có quyền xem đơn này');
      }
    }

    return request;
  },
};
