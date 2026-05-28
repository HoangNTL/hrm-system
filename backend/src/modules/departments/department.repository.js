import { prisma } from '../../config/database.js';

export const departmentSelect = {
  id: true,
  name: true,
  code: true,
  description: true,
  status: true,
  created_at: true,
  updated_at: true,
};

export const departmentRepository = {
  findMany({ where, skip, take }, db = prisma) {
    return db.department.findMany({
      where,
      select: departmentSelect,
      skip,
      take,
      orderBy: { id: 'desc' },
    });
  },

  count(where, db = prisma) {
    return db.department.count({ where });
  },

  findActiveById(id, db = prisma) {
    return db.department.findFirst({
      where: { id, is_deleted: false },
      select: departmentSelect,
    });
  },

  findRawById(id, db = prisma) {
    return db.department.findUnique({
      where: { id },
      select: { id: true, is_deleted: true, code: true, name: true },
    });
  },

  create(data, db = prisma) {
    return db.department.create({
      data,
      select: departmentSelect,
    });
  },

  updateById(id, data, db = prisma) {
    return db.department.update({
      where: { id },
      data,
      select: departmentSelect,
    });
  },

  softDeleteById(id, deletedAt = new Date(), db = prisma) {
    return db.department.update({
      where: { id },
      data: { is_deleted: true, deleted_at: deletedAt },
    });
  },
};
