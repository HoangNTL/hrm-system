import { prisma } from '../config/db.js';

export const getDepartments = async ({ page = 1, limit = 10, search = '' } = {}) => {
  const where = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const total = await prisma.department.count({ where });
  const data = await prisma.department.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { id: 'desc' },
  });

  return { data, total, page, limit };
};

export const getDepartmentById = async (id) => {
  const department = await prisma.department.findUnique({ where: { id } });
  if (!department) {
    throw new Error('Department not found');
  }
  return department;
};

export const createDepartment = async ({ name, description }) => {
  if (!name || !name.trim()) {
    throw new Error('Missing required field: name');
  }

  // Auto-generate code from name (convert to uppercase, remove spaces/special chars)
  const code = name.trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  const department = await prisma.department.create({
    data: {
      name: name.trim(),
      code,
      description: description || null,
    },
  });

  return department;
};

export const updateDepartment = async (id, { name, description }) => {
  const department = await prisma.department.findUnique({ where: { id } });
  if (!department) {
    throw new Error('Department not found');
  }

  const updateData = {};
  if (name !== undefined) updateData.name = name.trim();
  if (description !== undefined) updateData.description = description;

  const updated = await prisma.department.update({
    where: { id },
    data: updateData,
  });

  return updated;
};

export const deleteDepartment = async (id) => {
  const department = await prisma.department.findUnique({ where: { id } });
  if (!department) {
    throw new Error('Department not found');
  }

  await prisma.department.delete({ where: { id } });
  return true;
};
