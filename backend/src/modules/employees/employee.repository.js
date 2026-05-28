import { prisma } from '../../config/database.js';

export const employeeSelect = {
  id: true,
  full_name: true,
  gender: true,
  dob: true,
  identity_number: true,
  phone: true,
  email: true,
  address: true,
  work_status: true,
  created_at: true,
  updated_at: true,
  department: {
    select: {
      id: true,
      code: true,
      name: true,
    },
  },
  position: {
    select: {
      id: true,
      name: true,
    },
  },
  user_account: {
    select: {
      id: true,
      email: true,
      role: true,
    },
  },
};

const employeeCreateSelect = {
  id: true,
  full_name: true,
  gender: true,
  dob: true,
  identity_number: true,
  phone: true,
  email: true,
  address: true,
  department_id: true,
  position_id: true,
  created_at: true,
  updated_at: true,
};

const employeeSelectListSelect = {
  id: true,
  full_name: true,
  email: true,
};

export const employeeRepository = {
  findMany({ where, skip, take }, db = prisma) {
    return db.employee.findMany({
      where,
      skip,
      take,
      orderBy: { id: 'desc' },
      select: employeeSelect,
    });
  },

  count(where, db = prisma) {
    return db.employee.count({ where });
  },

  findSelectList(where, db = prisma) {
    return db.employee.findMany({
      where,
      select: employeeSelectListSelect,
      orderBy: { full_name: 'asc' },
    });
  },

  findActiveById(id, db = prisma) {
    return db.employee.findFirst({
      where: { id, is_deleted: false },
      select: employeeSelect,
    });
  },

  findRawById(id, db = prisma) {
    return db.employee.findUnique({
      where: { id },
      select: {
        id: true,
        is_deleted: true,
      },
    });
  },

  create(data, db = prisma) {
    return db.employee.create({
      data,
      select: employeeCreateSelect,
    });
  },

  updateById(id, data, db = prisma) {
    return db.employee.update({
      where: { id },
      data,
      select: employeeSelect,
    });
  },

  softDeleteById(id, deletedAt = new Date(), db = prisma) {
    return db.employee.update({
      where: { id },
      data: { is_deleted: true, deleted_at: deletedAt },
    });
  },

  findLinkedActiveUser(employeeId, db = prisma) {
    return db.user.findFirst({
      where: { employee_id: employeeId, is_deleted: false },
      select: { id: true },
    });
  },

  softDeleteLinkedUser(userId, deletedAt = new Date(), db = prisma) {
    return db.user.update({
      where: { id: userId },
      data: {
        is_locked: true,
        is_deleted: true,
        deleted_at: deletedAt,
      },
    });
  },

  transaction(callback) {
    return prisma.$transaction(callback);
  },
};
