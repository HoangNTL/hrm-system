import { prisma } from '../config/db.js';

/**
 * Position Service
 * Handles business logic related to positions.
 */
export const positionService = {
  /**
   * Get all positions (with search + pagination)
   * @param {Object} params
   * @param {string} params.search
   * @param {number} params.page
   * @param {number} params.limit
   * @returns {Object} Response object
   */
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
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          created_at: true,
          updated_at: true,
        },
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

  /**
   * Get a single position by id
   * @param {number} id
   * @returns {Object} Response object
   */
  async getById(id) {
    const position = await prisma.position.findUnique({
      where: { id }, select: {
        id: true,
        name: true,
        description: true,
        status: true,
        created_at: true,
        updated_at: true,
      }
    });

    if (!position || position.is_deleted) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'Position not found');
    }

    return position;
  },

  /**
   * Create a new position
   * @param {{ name: string, description?: string|null, status?: boolean }} payload
   */
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
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        created_at: true,
        updated_at: true,
      }
    });

    return position;
  },

  /**
   * Update a position by id
   * @param {number} id
   * @param {{ name?: string, description?: string|null, status?: boolean }} payload
   */
  async update(id, { name, description, status }) {
    const existing = await prisma.position.findUnique({ where: { id, is_deleted: false } });
    if (!existing) {
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
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        created_at: true,
        updated_at: true,
      }
    });
    return updated;
  },

  /**
   * Delete a position by id
   * @param {number} id
   */
  async delete(id) {
    const existing = await prisma.position.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'Position not found');
    }
    // await prisma.position.delete({ where: { id } });
    await prisma.position.update({
      where: { id },
      data: { is_deleted: true, deleted_at: new Date() }, // soft delete
    });
    return { id };
  },
};
