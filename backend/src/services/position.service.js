import { prisma } from '../config/db.js';
import ApiError from '../utils/ApiError.js';
import { ERROR_CODES } from '../utils/errorCodes.js';

// standardized select fields for position
const positionSelect = {
  id: true,
  name: true,
  description: true,
  status: true,
  created_at: true,
  updated_at: true,
};

export const positionService = {
  // Get all positions (with search + pagination)
  async getAll({ search = '', page = 1, limit = 10 } = {}) {
    const skip = (page - 1) * limit;

    // Build search filter
    const where = search
      ? { name: { contains: search, mode: 'insensitive' }, is_deleted: false }
      : { is_deleted: false };

    // Fetch data and total count in parallel
    const [data, total] = await Promise.all([
      prisma.position.findMany({
        where,
        select: positionSelect,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      prisma.position.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.max(Math.ceil(total / limit), 1),
      },
    };
  },

  async getById(id) {
    const position = await prisma.position.findUnique({
      where: { id }, select: positionSelect
    });

    if (!position || position.is_deleted) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'Position not found');
    }

    return position;
  },

  async create({ name, description, status }) {
    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Name is required');
    }

    const position = await prisma.position.create({
      data: {
        name: name.trim(),
        description: description ?? null,
        status: status === undefined ? true : Boolean(status),
      },
      select: positionSelect,
    });

    return position;
  },

  async update(id, { name, description, status }) {
    const existing = await prisma.position.findUnique({ where: { id } });
    if (!existing || existing.is_deleted) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'Position not found');
    }

    const data = {};
    if (name !== undefined) {
      if (!String(name).trim()) {
        throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Name cannot be empty');
      }
      data.name = String(name).trim();
    }
    if (description !== undefined) data.description = description;
    if (status !== undefined) data.status = Boolean(status);

    if (Object.keys(data).length === 0) {
      throw new ApiError(ERROR_CODES.BAD_REQUEST, 'No fields to update');
    }

    const updated = await prisma.position.update({
      where: { id },
      data,
      select: positionSelect,
    });

    return updated;
  },

  async delete(id) {
    const existing = await prisma.position.findUnique({ where: { id } });
    if (!existing || existing.is_deleted) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'Position not found');
    }

    await prisma.position.update({
      where: { id },
      data: { is_deleted: true, deleted_at: new Date() }, // soft delete
    });
    return { id };
  },
};
