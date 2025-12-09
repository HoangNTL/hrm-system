import { prisma } from '../config/db.js';

export const getPositions = async ({ page = 1, limit = 100, search = '' } = {}) => {
  const where = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const total = await prisma.position.count({ where });
  const data = await prisma.position.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { id: 'asc' },
  });

  return { data, total, page, limit };
};

export const getPositionById = async (id) => {
  const position = await prisma.position.findUnique({ where: { id } });
  if (!position) {
    throw new Error('Position not found');
  }
  return position;
};

export const createPosition = async ({ name, description }) => {
  if (!name || !name.trim()) {
    throw new Error('Missing required field: name');
  }

  const position = await prisma.position.create({
    data: {
      name: name.trim(),
      description: description || null,
    },
  });

  return position;
};

export const updatePosition = async (id, { name, description }) => {
  const position = await prisma.position.findUnique({ where: { id } });
  if (!position) {
    throw new Error('Position not found');
  }

  const updateData = {};
  if (name !== undefined) updateData.name = name.trim();
  if (description !== undefined) updateData.description = description;

  const updated = await prisma.position.update({
    where: { id },
    data: updateData,
  });

  return updated;
};

export const deletePosition = async (id) => {
  const position = await prisma.position.findUnique({ where: { id } });
  if (!position) {
    throw new Error('Position not found');
  }

  await prisma.position.delete({ where: { id } });
  return true;
};
