import bcrypt from 'bcrypt';
import crypto from 'crypto';

import ApiError from '../../utils/ApiError.js';
import { ERROR_CODES } from '../../utils/errorCodes.js';
import {
  UserRole,
  isValidUserRole,
  normalizeUserRole,
} from '../../shared/constants/roles.js';
import { userRepository } from './user.repository.js';

export const userService = {
  async getAll({ search = '', role = '', status = '', page = 1, limit = 10 } = {}) {
    const skip = (page - 1) * limit;
    const where = { is_deleted: false };

    if (search) {
      where.OR = [{ email: { contains: search, mode: 'insensitive' } }];
    }

    if (role) {
      const normalizedRole = normalizeUserRole(role);
      if (!isValidUserRole(normalizedRole)) {
        throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Invalid role');
      }
      where.role = normalizedRole;
    }

    if (status) {
      switch (status) {
        case 'active':
          where.is_locked = false;
          break;
        case 'locked':
          where.is_locked = true;
          break;
        case 'never_logged_in':
          where.last_login_at = null;
          break;
      }
    }

    const [data, total] = await Promise.all([
      userRepository.findMany({ where, skip, take: limit }),
      userRepository.count(where),
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

  async create({ email, role = UserRole.STAFF, employee_id, password }, tx) {
    if (!email || !email.trim()) {
      throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Email is required');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await userRepository.findByEmail(normalizedEmail, tx);
    if (existing) {
      throw new ApiError(ERROR_CODES.CONFLICT, 'Email already exists');
    }

    const normalizedRole = normalizeUserRole(role, UserRole.STAFF);
    if (!isValidUserRole(normalizedRole)) {
      throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Invalid role');
    }

    const plainPassword = password || this._generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const data = {
      email: normalizedEmail,
      password_hash: hashedPassword,
      role: normalizedRole,
    };

    if (employee_id) {
      data.employee = { connect: { id: employee_id } };
    }

    const user = await userRepository.create(data, tx);
    return { user, password: plainPassword };
  },

  async resetPassword(id) {
    const existing = await userRepository.findActiveById(id);
    if (!existing) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'User not found');
    }

    const newPassword = this._generatePassword();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await userRepository.updateById(id, {
      password_hash: hashedPassword,
      must_change_password: true,
    });

    return { password: newPassword };
  },

  async toggleLock(id) {
    const existing = await userRepository.findActiveById(id);
    if (!existing) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'User not found');
    }

    return userRepository.updateById(id, {
      is_locked: !existing.is_locked,
    });
  },

  async updateLastLogin(id) {
    await userRepository.updateLastLogin(id);
  },

  async getStats() {
    const [total, locked, neverLoggedIn] = await Promise.all([
      userRepository.count({ is_deleted: false }),
      userRepository.count({ is_deleted: false, is_locked: true }),
      userRepository.count({ is_deleted: false, last_login_at: null }),
    ]);

    return {
      total,
      active: total - locked,
      locked,
      never_logged_in: neverLoggedIn,
    };
  },

  async bulkDelete(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Invalid user IDs');
    }

    const result = await userRepository.softDeleteMany(ids);
    return { deleted_count: result.count };
  },

  async getCurrentProfile(userId) {
    const user = await userRepository.findCurrentProfileById(userId);
    if (!user) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'User not found');
    }

    return user;
  },

  async updateCurrentProfile(userId, { full_name, phone, address, gender, dob }) {
    const user = await userRepository.findActiveUserLinkById(userId);
    if (!user) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'User not found');
    }
    if (!user.employee_id) {
      throw new ApiError(ERROR_CODES.BAD_REQUEST, 'User has no linked employee profile');
    }

    const data = {};
    if (full_name !== undefined) data.full_name = full_name;
    if (phone !== undefined) data.phone = phone;
    if (address !== undefined) data.address = address;
    if (gender !== undefined) data.gender = gender;
    if (dob !== undefined) {
      const dobDate = new Date(dob);
      if (Number.isNaN(dobDate.getTime())) {
        throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Invalid date format for dob');
      }
      data.dob = dobDate;
    }

    return userRepository.updateEmployeeProfile(user.employee_id, data);
  },

  _generatePassword() {
    const length = 12;
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';
    const allChars = uppercase + lowercase + numbers + symbols;

    const randomChar = (set) => set[crypto.randomInt(0, set.length)];

    let password = '';
    password += randomChar(uppercase);
    password += randomChar(lowercase);
    password += randomChar(numbers);
    password += randomChar(symbols);

    for (let i = 4; i < length; i += 1) {
      password += randomChar(allChars);
    }

    const chars = password.split('');
    for (let i = chars.length - 1; i > 0; i -= 1) {
      const j = crypto.randomInt(0, i + 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }

    return chars.join('');
  },
};
