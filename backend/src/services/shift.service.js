import { prisma } from '../config/db.js';
import ApiError from '../utils/ApiError.js';
import { ERROR_CODES } from '../utils/errorCodes.js';

// Helper: Convert time string (HH:mm or full datetime) to TIME object
const parseTimeString = (timeStr) => {
  if (!timeStr) return null;
  
  // If already a Date, extract the time
  if (timeStr instanceof Date) {
    return timeStr;
  }
  
  // If it's a string
  if (typeof timeStr === 'string') {
    // Check if it's ISO datetime (contains 'T')
    if (timeStr.includes('T')) {
      // Parse ISO datetime and extract time part
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) {
        throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Invalid datetime format');
      }
      return date;
    }
    
    // Parse HH:mm format
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
      throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Invalid time format. Use HH:mm or ISO datetime');
    }
    // Create time for Prisma TIME type - store as HH:mm:ss
    const timeObj = new Date();
    timeObj.setHours(hours, minutes, 0, 0);
    return timeObj;
  }
  
  return timeStr;
};

const shiftSelect = {
  id: true,
  shift_name: true,
  start_time: true,
  end_time: true,
  early_check_in_minutes: true,
  late_checkout_minutes: true,
  created_at: true,
  updated_at: true,
};

export const shiftService = {
  // Get all shifts (with search + pagination)
  async getAll({ search = '', page = 1, limit = 10 } = {}) {
    const skip = (page - 1) * limit;

    const where = search
      ? {
          shift_name: { contains: search, mode: 'insensitive' },
          is_deleted: false,
        }
      : { is_deleted: false };

    const [data, total] = await Promise.all([
      prisma.shift.findMany({
        where,
        select: shiftSelect,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      prisma.shift.count({ where }),
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
    const shift = await prisma.shift.findUnique({
      where: { id },
      select: shiftSelect,
    });

    if (!shift) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'Shift not found');
    }

    return shift;
  },

  async create({
    shift_name,
    start_time,
    end_time,
    early_check_in_minutes,
    late_checkout_minutes,
  }) {
    if (!shift_name || !shift_name.trim()) {
      throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Shift name is required');
    }

    const shift = await prisma.shift.create({
      data: {
        shift_name: shift_name.trim(),
        start_time: parseTimeString(start_time),
        end_time: parseTimeString(end_time),
        early_check_in_minutes:
          early_check_in_minutes !== undefined
            ? Number(early_check_in_minutes)
            : 15,
        late_checkout_minutes:
          late_checkout_minutes !== undefined
            ? Number(late_checkout_minutes)
            : 15,
      },
      select: shiftSelect,
    });

    return shift;
  },

  async update(
    id,
    {
      shift_name,
      start_time,
      end_time,
      early_check_in_minutes,
      late_checkout_minutes,
    },
  ) {
    const existing = await prisma.shift.findUnique({ where: { id } });
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
    if (early_check_in_minutes !== undefined)
      data.early_check_in_minutes = Number(early_check_in_minutes);
    if (late_checkout_minutes !== undefined)
      data.late_checkout_minutes = Number(late_checkout_minutes);

    if (Object.keys(data).length === 0) {
      throw new ApiError(ERROR_CODES.BAD_REQUEST, 'No fields to update');
    }

    const updated = await prisma.shift.update({
      where: { id },
      data,
      select: shiftSelect,
    });

    return updated;
  },

  async delete(id) {
    const existing = await prisma.shift.findUnique({ where: { id } });
    if (!existing || existing.is_deleted) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'Shift not found');
    }

    await prisma.shift.update({
      where: { id },
      data: { is_deleted: true, deleted_at: new Date() },
    });

    return { id };
  },
};
