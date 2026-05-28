import ApiError from '../../utils/ApiError.js';
import { ERROR_CODES } from '../../utils/errorCodes.js';
import { positionRepository } from './position.repository.js';

export const positionService = {
  async getAll({ search = '', page = 1, limit = 10 } = {}) {
    const skip = (page - 1) * limit;
    const where = search
      ? { name: { contains: search, mode: 'insensitive' }, is_deleted: false }
      : { is_deleted: false };

    const [data, total] = await Promise.all([
      positionRepository.findMany({ where, skip, take: limit }),
      positionRepository.count(where),
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
    const position = await positionRepository.findActiveById(id);
    if (!position) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'Position not found');
    }
    return position;
  },

  async create({ name, description, status }) {
    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Name is required');
    }

    return positionRepository.create({
      name: name.trim(),
      description: description ?? null,
      status: status === undefined ? true : Boolean(status),
    });
  },

  async update(id, { name, description, status }) {
    const existing = await positionRepository.findRawById(id);
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

    return positionRepository.updateById(id, data);
  },

  async delete(id) {
    const existing = await positionRepository.findRawById(id);
    if (!existing || existing.is_deleted) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'Position not found');
    }

    await positionRepository.softDeleteById(id);
    return { id };
  },
};
