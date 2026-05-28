import ApiError from '../../utils/ApiError.js';
import { ERROR_CODES } from '../../utils/errorCodes.js';
import { shiftRepository } from './shift.repository.js';

const parseTimeString = (timeStr) => {
  if (!timeStr) return null;
  if (timeStr instanceof Date) return timeStr;

  if (typeof timeStr === 'string') {
    if (timeStr.includes('T')) {
      const date = new Date(timeStr);
      if (Number.isNaN(date.getTime())) {
        throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Invalid datetime format');
      }
      return date;
    }

    const [hours, minutes] = timeStr.split(':').map(Number);
    if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
      throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Invalid time format. Use HH:mm or ISO datetime');
    }
    const timeObj = new Date();
    timeObj.setHours(hours, minutes, 0, 0);
    return timeObj;
  }

  return timeStr;
};

export const shiftService = {
  async getAll({ search = '', page = 1, limit = 10 } = {}) {
    const skip = (page - 1) * limit;
    const where = search
      ? { shift_name: { contains: search, mode: 'insensitive' }, is_deleted: false }
      : { is_deleted: false };

    const [data, total] = await Promise.all([
      shiftRepository.findMany({ where, skip, take: limit }),
      shiftRepository.count(where),
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
    const shift = await shiftRepository.findActiveById(id);
    if (!shift) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'Shift not found');
    }
    return shift;
  },

  async create({ shift_name, start_time, end_time, early_check_in_minutes, late_checkout_minutes }) {
    if (!shift_name || !shift_name.trim()) {
      throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Shift name is required');
    }

    return shiftRepository.create({
      shift_name: shift_name.trim(),
      start_time: parseTimeString(start_time),
      end_time: parseTimeString(end_time),
      early_check_in_minutes:
        early_check_in_minutes !== undefined ? Number(early_check_in_minutes) : 15,
      late_checkout_minutes:
        late_checkout_minutes !== undefined ? Number(late_checkout_minutes) : 15,
    });
  },

  async update(id, { shift_name, start_time, end_time, early_check_in_minutes, late_checkout_minutes }) {
    const existing = await shiftRepository.findRawById(id);
    if (!existing || existing.is_deleted) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'Shift not found');
    }

    const data = {};
    if (shift_name !== undefined) {
      if (!String(shift_name).trim()) {
        throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Shift name cannot be empty');
      }
      data.shift_name = String(shift_name).trim();
    }
    if (start_time !== undefined) data.start_time = parseTimeString(start_time);
    if (end_time !== undefined) data.end_time = parseTimeString(end_time);
    if (early_check_in_minutes !== undefined) data.early_check_in_minutes = Number(early_check_in_minutes);
    if (late_checkout_minutes !== undefined) data.late_checkout_minutes = Number(late_checkout_minutes);

    if (Object.keys(data).length === 0) {
      throw new ApiError(ERROR_CODES.BAD_REQUEST, 'No fields to update');
    }

    return shiftRepository.updateById(id, data);
  },

  async delete(id) {
    const existing = await shiftRepository.findRawById(id);
    if (!existing || existing.is_deleted) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'Shift not found');
    }
    await shiftRepository.softDeleteById(id);
    return { id };
  },
};
