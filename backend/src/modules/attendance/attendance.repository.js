import { prisma } from '../../config/database.js';

export const attendanceRepository = {
  findActiveShifts() {
    return prisma.shift.findMany({
      where: { is_deleted: false },
    });
  },

  findShiftById(shiftId) {
    return prisma.shift.findUnique({
      where: { id: shiftId },
    });
  },

  findFirstActiveShift() {
    return prisma.shift.findFirst({
      where: { is_deleted: false },
    });
  },

  findAttendanceByEmployeeDateShift(employeeId, date, shiftId) {
    return prisma.attendance.findUnique({
      where: {
        employee_id_date_shift_id: {
          employee_id: employeeId,
          date,
          shift_id: shiftId,
        },
      },
    });
  },

  upsertAttendanceByEmployeeDateShift(employeeId, date, shiftId, updateData, createData) {
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

  updateAttendanceByEmployeeDateShift(employeeId, date, shiftId, data) {
    return prisma.attendance.update({
      where: {
        employee_id_date_shift_id: {
          employee_id: employeeId,
          date,
          shift_id: shiftId,
        },
      },
      data,
    });
  },

  findTodayAttendanceByEmployeeAndShift(employeeId, date, shiftId) {
    return prisma.attendance.findFirst({
      where: {
        employee_id: employeeId,
        date,
        shift_id: shiftId,
        is_deleted: false,
      },
      include: { shift: true },
    });
  },

  findLatestTodayAttendanceByEmployee(employeeId, date) {
    return prisma.attendance.findFirst({
      where: {
        employee_id: employeeId,
        date,
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

  findMonthlyAttendances(employeeId, startDate, endDate) {
    return prisma.attendance.findMany({
      where: {
        employee_id: employeeId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        is_deleted: false,
      },
    });
  },

  findAttendanceHistory(employeeId, fromDate, toDate) {
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

  findManyAttendances(where, skip, take) {
    return prisma.attendance.findMany({
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
    });
  },

  countAttendances(where) {
    return prisma.attendance.count({ where });
  },

  findAttendanceWithShiftById(attendanceId) {
    return prisma.attendance.findUnique({
      where: { id: attendanceId },
      include: { shift: true },
    });
  },

  updateAttendanceById(attendanceId, data) {
    return prisma.attendance.update({
      where: { id: attendanceId },
      data,
      include: {
        employee: {
          include: {
            department: true,
          },
        },
        shift: true,
      },
    });
  },

  findAttendanceById(attendanceId) {
    return prisma.attendance.findUnique({
      where: { id: attendanceId },
    });
  },

  softDeleteAttendanceById(attendanceId) {
    return prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        is_deleted: true,
        deleted_at: new Date(),
      },
    });
  },
};
