import { prisma } from '../../config/database.js';

export const attendanceRequestRepository = {
  findUserEmployeeId(userId) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { employee_id: true },
    });
  },

  createRequest(data) {
    return prisma.attendanceRequest.create({
      data,
      include: {
        employee: {
          select: { id: true, full_name: true, email: true },
        },
      },
    });
  },

  findMyRequests(filter, skip, take) {
    return prisma.attendanceRequest.findMany({
      where: filter,
      include: {
        employee: { select: { full_name: true, email: true } },
        reviewer: { select: { email: true } },
      },
      orderBy: { created_at: 'desc' },
      skip,
      take,
    });
  },

  countRequests(filter) {
    return prisma.attendanceRequest.count({ where: filter });
  },

  findAllRequests(filter, skip, take) {
    return prisma.attendanceRequest.findMany({
      where: filter,
      include: {
        employee: { select: { id: true, full_name: true, email: true, department: true } },
        reviewer: { select: { email: true } },
      },
      orderBy: { created_at: 'desc' },
      skip,
      take,
    });
  },

  findRequestForApproval(id) {
    return prisma.attendanceRequest.findUnique({
      where: { id },
      include: { employee: true },
    });
  },

  findRequestDetail(id) {
    return prisma.attendanceRequest.findUnique({
      where: { id },
      include: {
        employee: { select: { full_name: true, email: true } },
        reviewer: { select: { email: true } },
      },
    });
  },

  updateRequestStatus(id, data) {
    return prisma.attendanceRequest.update({
      where: { id },
      data,
      include: {
        employee: { select: { full_name: true, email: true } },
        reviewer: { select: { email: true } },
      },
    });
  },

  findAttendanceById(id) {
    return prisma.attendance.findUnique({
      where: { id },
      include: { shift: true },
    });
  },

  updateAttendanceById(id, data) {
    return prisma.attendance.update({
      where: { id },
      data,
    });
  },

  findFirstActiveShift() {
    return prisma.shift.findMany({
      where: { is_deleted: false },
      take: 1,
    });
  },

  findExistingAttendanceByEmployeeDate(employeeId, date) {
    return prisma.attendance.findFirst({
      where: {
        employee_id: employeeId,
        date,
        is_deleted: false,
      },
    });
  },

  upsertAttendance(employeeId, date, shiftId, updateData, createData) {
    return prisma.attendance.upsert({
      where: {
        employee_id_date_shift_id: {
          employee_id: employeeId,
          date,
          shift_id: shiftId,
        },
      },
      update: updateData,
      create: createData,
    });
  },
};
