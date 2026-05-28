import { prisma } from '../../config/database.js';

export const positionSelect = {
  id: true,
  name: true,
  description: true,
  status: true,
  created_at: true,
  updated_at: true,
};

export const positionRepository = {
  findMany({ where, skip, take }, db = prisma) {
    return db.position.findMany({
      where,
      select: positionSelect,
      skip,
      take,
      orderBy: { id: 'desc' },
    });
  },

  count(where, db = prisma) {
    return db.position.count({ where });
  },

  findActiveById(id, db = prisma) {
    return db.position.findFirst({
      where: { id, is_deleted: false },
      select: positionSelect,
    });
  },

  findRawById(id, db = prisma) {
    return db.position.findUnique({
      where: { id },
      select: { id: true, is_deleted: true },
    });
  },

  create(data, db = prisma) {
    return db.position.create({
      data,
      select: positionSelect,
    });
  },

  updateById(id, data, db = prisma) {
    return db.position.update({
      where: { id },
      data,
      select: positionSelect,
    });
  },

  softDeleteById(id, deletedAt = new Date(), db = prisma) {
    return db.position.update({
      where: { id },
      data: { is_deleted: true, deleted_at: deletedAt },
    });
  },
};
