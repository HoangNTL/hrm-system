import { prisma } from '../../config/database.js';

export const userSelect = {
  id: true,
  email: true,
  role: true,
  is_locked: true,
  must_change_password: true,
  last_login_at: true,
  created_at: true,
  updated_at: true,
  employee: {
    select: {
      id: true,
      full_name: true,
      email: true,
      phone: true,
      address: true,
      dob: true,
      gender: true,
      hire_date: true,
      work_status: true,
      department: { select: { id: true, name: true } },
      position: { select: { id: true, name: true } },
    },
  },
};

const currentProfileSelect = {
  id: true,
  email: true,
  role: true,
  employee_id: true,
  must_change_password: true,
  is_locked: true,
  last_login_at: true,
  employee: {
    select: {
      id: true,
      full_name: true,
      phone: true,
      email: true,
      address: true,
      dob: true,
      gender: true,
      hire_date: true,
      work_status: true,
      department: { select: { id: true, name: true } },
      position: { select: { id: true, name: true } },
    },
  },
};

const currentProfileUpdateSelect = {
  id: true,
  full_name: true,
  phone: true,
  email: true,
  address: true,
  gender: true,
  dob: true,
  department: { select: { id: true, name: true } },
  position: { select: { id: true, name: true } },
};

export const userRepository = {
  findCurrentProfileById(userId, db = prisma) {
    return db.user.findFirst({
      where: { id: userId, is_deleted: false },
      select: currentProfileSelect,
    });
  },

  findActiveUserLinkById(userId, db = prisma) {
    return db.user.findFirst({
      where: { id: userId, is_deleted: false },
      select: { id: true, employee_id: true },
    });
  },

  updateEmployeeProfile(employeeId, data, db = prisma) {
    return db.employee.update({
      where: { id: employeeId },
      data,
      select: currentProfileUpdateSelect,
    });
  },

  findByEmail(email, db = prisma) {
    return db.user.findUnique({
      where: { email },
      select: { id: true },
    });
  },

  findActiveById(id, db = prisma) {
    return db.user.findFirst({
      where: { id, is_deleted: false },
      select: {
        id: true,
        is_locked: true,
      },
    });
  },

  findMany({ where, skip, take }, db = prisma) {
    return db.user.findMany({
      where,
      skip,
      take,
      orderBy: { id: 'desc' },
      select: userSelect,
    });
  },

  count(where, db = prisma) {
    return db.user.count({ where });
  },

  create(data, db = prisma) {
    return db.user.create({
      data,
      select: {
        id: true,
        email: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
    });
  },

  updateById(id, data, db = prisma) {
    return db.user.update({
      where: { id },
      data,
      select: userSelect,
    });
  },

  updateLastLogin(id, db = prisma) {
    return db.user.update({
      where: { id },
      data: { last_login_at: new Date() },
    });
  },

  softDeleteMany(ids, deletedAt = new Date(), db = prisma) {
    return db.user.updateMany({
      where: {
        id: { in: ids },
        is_deleted: false,
      },
      data: {
        is_deleted: true,
        deleted_at: deletedAt,
      },
    });
  },
};
