import { prisma } from '../../config/database.js';

export const payrollRepository = {
  findLatestActiveContract(employeeId, db = prisma) {
    return db.contract.findFirst({
      where: {
        employee_id: employeeId,
        is_deleted: false,
        status: 'active',
      },
      orderBy: { start_date: 'desc' },
    });
  },

  findAttendancesByEmployeeAndRange(employeeId, start, end, db = prisma) {
    return db.attendance.findMany({
      where: {
        employee_id: employeeId,
        date: { gte: start, lte: end },
        is_deleted: false,
      },
    });
  },

  findActiveEmployeeById(employeeId, db = prisma) {
    return db.employee.findFirst({
      where: { id: employeeId, is_deleted: false },
      include: { department: true, position: true },
    });
  },

  findActiveEmployees({ where, skip, take }, db = prisma) {
    return db.employee.findMany({
      where,
      include: { department: true, position: true },
      orderBy: { id: 'desc' },
      ...(skip !== undefined ? { skip } : {}),
      ...(take !== undefined ? { take } : {}),
    });
  },

  countActiveEmployees(where, db = prisma) {
    return db.employee.count({ where });
  },

  findActiveContractsByEmployeeIds(employeeIds, db = prisma) {
    return db.contract.findMany({
      where: {
        employee_id: { in: employeeIds },
        is_deleted: false,
        status: 'active',
      },
      select: {
        id: true,
        code: true,
        salary: true,
        employee_id: true,
        start_date: true,
      },
      orderBy: [{ employee_id: 'asc' }, { start_date: 'desc' }],
    });
  },

  findAttendancesByEmployeeIdsAndRange(employeeIds, start, end, db = prisma) {
    return db.attendance.findMany({
      where: {
        employee_id: { in: employeeIds },
        date: { gte: start, lte: end },
        is_deleted: false,
      },
      select: {
        employee_id: true,
        work_hours: true,
        late_minutes: true,
        status: true,
      },
    });
  },
};
