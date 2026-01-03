import bcrypt from 'bcrypt';
import crypto from "crypto";

import { prisma } from '../config/db.js';
import ApiError from '../utils/ApiError.js';
import { ERROR_CODES } from '../utils/errorCodes.js';

// standardized select fields for user (Prisma fields only, no methods)
const userSelect = {
  id: true,
  email: true,
  role: true,
  is_locked: true,
  must_change_password: true,
  last_login_at: true,
  created_at: true,
  updated_at: true,
  employee: {
    select: {
      id: true,
      full_name: true,
      email: true,
      phone: true,
      address: true,
      dob: true,
      gender: true,
      hire_date: true,
      work_status: true,
      department: { select: { id: true, name: true } },
      position: { select: { id: true, name: true } },
    },
  },
};

class UserService {
  async getCurrentProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId, is_deleted: false },
      select: {
        id: true,
        email: true,
        role: true,
        employee_id: true,
        must_change_password: true,
        is_locked: true,
        last_login_at: true,
        employee: {
          select: {
            id: true,
            full_name: true,
            phone: true,
            email: true,
            address: true,
            dob: true,
            gender: true,
            hire_date: true,
            work_status: true,
            department: { select: { id: true, name: true } },
            position: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!user) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'User not found');
    }
    return user;
  }

  async updateCurrentProfile(userId, { full_name, phone, address, gender, dob }) {
    const user = await prisma.user.findUnique({ where: { id: userId, is_deleted: false } });
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
      if (isNaN(dobDate.getTime())) {
        throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Invalid date format for dob');
      }
      data.dob = dobDate;
    }

    const employee = await prisma.employee.update({
      where: { id: user.employee_id },
      data,
      select: {
        id: true,
        full_name: true,
        phone: true,
        email: true,
        address: true,
        gender: true,
        dob: true,
        department: { select: { id: true, name: true } },
        position: { select: { id: true, name: true } },
      },
    });

    return employee;
  }
}

export const userService = {
  async getAll({ search = '', role = '', status = '', page = 1, limit = 10 } = {}) {
    const skip = (page - 1) * limit;

    // Build where clause
    const where = { is_deleted: false };

    // Search filter
    if (search && search.trim()) {
      where.OR = [
        { email: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    // Role filter
    if (role && role.trim()) {
      where.role = role.toUpperCase();
    }

    // Status filter
    if (status && status.trim()) {
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
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        select: userSelect,
      }),
      prisma.user.count({ where }),
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

  // async getById(id) {
  //   const user = await prisma.user.findUnique({
  //     where: { id },
  //     select: userSelect,
  //   });
  //   if (!user || user.is_deleted) {
  //     throw new ApiError(ERROR_CODES.NOT_FOUND, 'User not found');
  //   }
  //   return user;
  // },

  async create({ email, role = 'STAFF', employee_id, password }, tx = prisma) {
    if (!email || !email.trim()) {
      throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Email is required');
    }

    email = email.trim().toLowerCase();

    // Limit selected columns to avoid selecting non-existent fields
    const existing = await tx.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) {
      throw new ApiError(ERROR_CODES.CONFLICT, 'Email already exists');
    }

    // Normalize and validate role enum
    let normalizedRole = String(role || 'STAFF').toUpperCase();
    if (normalizedRole === 'HR') normalizedRole = 'MANAGER';
    const validRoles = ['ADMIN', 'MANAGER', 'STAFF'];
    if (!validRoles.includes(normalizedRole)) {
      throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Invalid role');
    }

    const plainPassword = password || this._generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const user = await tx.user.create({
      data: {
        email,
        password_hash: hashedPassword,
        role: normalizedRole,
        employee_id: employee_id || null,
        email_verified: true,
      },
      select: {
        id: true,
        email: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
    });

    return { user, password: plainPassword };
  },

  // async update(id, { email, role, employee_id, password }) {
  //   const existing = await prisma.user.findUnique({ where: { id } });
  //   if (!existing || existing.is_deleted) {
  //     throw new ApiError(ERROR_CODES.NOT_FOUND, 'User not found');
  //   }

  //   const data = {};
  //   if (email !== undefined) {
  //     const trimmed = String(email).trim();
  //     if (!trimmed) {
  //       throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Email cannot be empty');
  //     }
  //     data.email = trimmed;
  //   }
  //   if (role !== undefined) data.role = role;
  //   if (employee_id !== undefined) data.employee_id = employee_id;

  //   let newPlainPassword = null;
  //   if (password !== undefined) {
  //     // if password is explicitly provided (including empty string), validate
  //     if (password === null || password === '') {
  //       throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Password cannot be empty');
  //     }
  //     newPlainPassword = String(password);
  //     data.password_hash = await bcrypt.hash(newPlainPassword, 10);
  //   }

  //   if (Object.keys(data).length === 0) {
  //     throw new ApiError(ERROR_CODES.BAD_REQUEST, 'No fields to update');
  //   }

  //   const updated = await prisma.user.update({
  //     where: { id },
  //     data,
  //     select: userSelect,
  //   });

  //   return newPlainPassword
  //     ? { user: updated, password: newPlainPassword }
  //     : { user: updated };
  // },

  // async delete(id) {
  //   const existing = await prisma.user.findUnique({ where: { id } });
  //   if (!existing || existing.is_deleted) {
  //     throw new ApiError(ERROR_CODES.NOT_FOUND, 'User not found');
  //   }

  //   await prisma.user.update({
  //     where: { id },
  //     data: { is_deleted: true, deleted_at: new Date() },
  //   });

  //   return { id };
  // },

  async resetPassword(id) {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing || existing.is_deleted) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'User not found');
    }

    const newPassword = this._generatePassword();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id },
      data: {
        password_hash: hashedPassword,
        must_change_password: true,
      },
    });

    return { password: newPassword };
  },

  async toggleLock(id) {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing || existing.is_deleted) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'User not found');
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { is_locked: !existing.is_locked },
      select: userSelect,
    });

    return updated;
  },

  async updateLastLogin(id) {
    await prisma.user.update({
      where: { id },
      data: { last_login_at: new Date() },
    });
  },

  async getStats() {
    const [total, locked, neverLoggedIn] = await Promise.all([
      prisma.user.count({ where: { is_deleted: false } }),
      prisma.user.count({ where: { is_deleted: false, is_locked: true } }),
      prisma.user.count({ where: { is_deleted: false, last_login_at: null } }),
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

    const result = await prisma.user.updateMany({
      where: {
        id: { in: ids },
        is_deleted: false,
      },
      data: {
        is_deleted: true,
        deleted_at: new Date(),
      },
    });

    return { deleted_count: result.count };
  },

  _generatePassword() {
    const length = 12;

    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';

    const allChars = uppercase + lowercase + numbers + symbols;

    const randomChar = (set) =>
      set[crypto.randomInt(0, set.length)];

    let password = "";

    password += randomChar(uppercase);
    password += randomChar(lowercase);
    password += randomChar(numbers);
    password += randomChar(symbols);

    for (let i = 4; i < length; i++) {
      password += randomChar(allChars);
    }

    // Shuffle password bằng Fisher–Yates (crypto secure)
    const array = password.split("");
    for (let i = array.length - 1; i > 0; i--) {
      const j = crypto.randomInt(0, i + 1);
      [array[i], array[j]] = [array[j], array[i]];
    }

    return array.join("");
  },

  // Expose profile methods from UserService class
  async getCurrentProfile(userId) {
    return new UserService().getCurrentProfile(userId);
  },

  async updateCurrentProfile(userId, data) {
    return new UserService().updateCurrentProfile(userId, data);
  }
};
