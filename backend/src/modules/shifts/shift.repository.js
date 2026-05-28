import { prisma } from '../../config/database.js';

export const shiftSelect = {
  id: true,
  shift_name: true,
  start_time: true,
  end_time: true,
  early_check_in_minutes: true,
  late_checkout_minutes: true,
  created_at: true,
  updated_at: true,
};

export const shiftRepository = {
  findMany({ where, skip, take }, db = prisma) {
    return db.shift.findMany({
      where,
      select: shiftSelect,
      skip,
      take,
      orderBy: { id: 'desc' },
    });
  },

  count(where, db = prisma) {
    return db.shift.count({ where });
  },

  findActiveById(id, db = prisma) {
    return db.shift.findFirst({
      where: { id, is_deleted: false },
      select: shiftSelect,
    });
  },

  findRawById(id, db = prisma) {
    return db.shift.findUnique({
      where: { id },
      select: { id: true, is_deleted: true },
    });
  },

  create(data, db = prisma) {
    return db.shift.create({
      data,
      select: shiftSelect,
    });
  },

  updateById(id, data, db = prisma) {
    return db.shift.update({
      where: { id },
      data,
      select: shiftSelect,
    });
  },

  softDeleteById(id, deletedAt = new Date(), db = prisma) {
    return db.shift.update({
      where: { id },
      data: { is_deleted: true, deleted_at: deletedAt },
    });
  },
};
