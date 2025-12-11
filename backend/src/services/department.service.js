import ApiError from '../utils/ApiError.js';
import { ERROR_CODES } from '../utils/errorCodes.js';
import { prisma } from '../config/db.js';

/**
 * Department Service
 * Handles business logic related to departments.
 */
export const departmentService = {
  /**
   * Get all departments (with search + pagination)
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
      prisma.department.findMany({
        where,
        select: {
          id: true,
          name: true,
          code: true,
          description: true,
          status: true,
          created_at: true,
          updated_at: true,
        },
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      prisma.department.count({ where }),
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
   * Get a single department by id
   * @param {number} id
   * @returns {Object} Response object
   */
  async getById(id) {
    const department = await prisma.department.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!department || department.is_deleted) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'Department not found');
    }

    return department;
  },

  /**
   * Create a new department
   * @param {{ name: string, code?: string, description?: string|null, status?: boolean }} payload
   */
  async create({ name, code, description, status }) {
    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Name is required');
    }

    // Auto-generate code if not provided
    const deptCode = code ? code.trim() : name.trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');

    const department = await prisma.department.create({
      data: {
        name: name.trim(),
        code: deptCode,
        description: description ?? null,
        status: status === undefined ? true : Boolean(status),
      },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });

    return department;
  },

  /**
   * Update a department by id
   * @param {number} id
   * @param {{ name?: string, code?: string, description?: string|null, status?: boolean }} payload
   */
  async update(id, { name, code, description, status }) {
    const existing = await prisma.department.findUnique({ where: { id, is_deleted: false } });
    if (!existing) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'Department not found');
    }

    const data = {};
    if (name !== undefined) {
      if (!String(name).trim()) {
        throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Name cannot be empty');
      }
      data.name = String(name).trim();
    }
    if (code !== undefined) {
      data.code = String(code).trim();
    }
    if (description !== undefined) data.description = description;
    if (status !== undefined) data.status = Boolean(status);

    if (Object.keys(data).length === 0) {
      throw new ApiError(ERROR_CODES.BAD_REQUEST, 'No fields to update');
    }

    const updated = await prisma.department.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });

    return updated;
  },

  /**
   * Delete a department by id (soft delete)
   * @param {number} id
   */
  async delete(id) {
    const existing = await prisma.department.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'Department not found');
    }

    await prisma.department.update({
      where: { id },
      data: { is_deleted: true, deleted_at: new Date() },
    });

    return { id };
  },
};
