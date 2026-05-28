import { prisma } from '../../config/database.js';

export const contractSelect = {
  id: true,
  code: true,
  contract_type: true,
  status: true,
  start_date: true,
  end_date: true,
  salary: true,
  work_location: true,
  notes: true,
  created_at: true,
  updated_at: true,
  employee: {
    select: {
      id: true,
      full_name: true,
      email: true,
      phone: true,
      department: {
        select: {
          id: true,
          name: true,
        },
      },
      position: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
};

export const contractRepository = {
  findMany({ where, skip, take }, db = prisma) {
    return db.contract.findMany({
      where,
      select: contractSelect,
      skip,
      take,
      orderBy: { created_at: 'desc' },
    });
  },

  count(where, db = prisma) {
    return db.contract.count({ where });
  },

  findActiveById(id, db = prisma) {
    return db.contract.findFirst({
      where: { id, is_deleted: false },
      select: contractSelect,
    });
  },

  findRawById(id, db = prisma) {
    return db.contract.findUnique({
      where: { id },
      select: { id: true, code: true, is_deleted: true },
    });
  },

  findByCode(code, db = prisma) {
    return db.contract.findUnique({
      where: { code },
      select: { id: true, code: true },
    });
  },

  findEmployeeById(id, db = prisma) {
    return db.employee.findUnique({
      where: { id },
      select: { id: true, is_deleted: true },
    });
  },

  create(data, db = prisma) {
    return db.contract.create({
      data,
      select: contractSelect,
    });
  },

  updateById(id, data, db = prisma) {
    return db.contract.update({
      where: { id },
      data,
      select: contractSelect,
    });
  },

  softDeleteById(id, deletedAt = new Date(), db = prisma) {
    return db.contract.update({
      where: { id },
      data: { is_deleted: true, deleted_at: deletedAt },
    });
  },
};
