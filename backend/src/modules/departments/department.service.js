import ApiError from '../../utils/ApiError.js';
import { ERROR_CODES } from '../../utils/errorCodes.js';
import { departmentRepository } from './department.repository.js';

export const departmentService = {
  async getAll({ search = '', page = 1, limit = 10 } = {}) {
    const skip = (page - 1) * limit;
    const where = search
      ? { name: { contains: search, mode: 'insensitive' }, is_deleted: false }
      : { is_deleted: false };

    const [data, total] = await Promise.all([
      departmentRepository.findMany({ where, skip, take: limit }),
      departmentRepository.count(where),
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
    const department = await departmentRepository.findActiveById(id);
    if (!department) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'Department not found');
    }

    return department;
  },

  async create({ name, code, description, status }) {
    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Name is required');
    }

    const departmentCode = code
      ? code.trim()
      : name
          .trim()
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_|_$/g, '');

    return departmentRepository.create({
      name: name.trim(),
      code: departmentCode,
      description: description ?? null,
      status: status === undefined ? true : Boolean(status),
    });
  },

  async update(id, { name, code, description, status }) {
    const existing = await departmentRepository.findRawById(id);
    if (!existing || existing.is_deleted) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'Department not found');
    }

    const data = {};
    if (name !== undefined) {
      if (!String(name).trim()) {
        throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Name cannot be empty');
      }
      data.name = String(name).trim();
    }
    if (code !== undefined) data.code = String(code).trim();
    if (description !== undefined) data.description = description;
    if (status !== undefined) data.status = Boolean(status);

    if (Object.keys(data).length === 0) {
      throw new ApiError(ERROR_CODES.BAD_REQUEST, 'No fields to update');
    }

    return departmentRepository.updateById(id, data);
  },

  async delete(id) {
    const existing = await departmentRepository.findRawById(id);
    if (!existing || existing.is_deleted) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'Department not found');
    }

    await departmentRepository.softDeleteById(id);
    return { id };
  },
};
