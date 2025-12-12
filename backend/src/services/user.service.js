import bcrypt from 'bcrypt';
import crypto from "crypto";

import { prisma } from '../config/db.js';
import ApiError from '../utils/ApiError.js';
import { ERROR_CODES } from '../utils/errorCodes.js';

// standardized select fields for user
const userSelect = {
  id: true,
  email: true,
  role: true,
  created_at: true,
  updated_at: true,
  employee: {
    select: {
      id: true,
      full_name: true,
      email: true,
    },
  },
};

export const userService = {
  async getAll({ search = '', page = 1, limit = 10 } = {}) {
    const skip = (page - 1) * limit;

    const where = search
      ? {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { role: { equals: search.toUpperCase(), mode: 'insensitive' } },
        ],
        is_deleted: false,
      }
      : { is_deleted: false };

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

  async create({ email, role = 'STAFF', employee_id, password }, tx) {
    if (!email || !email.trim()) {
      throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Email is required');
    }

    email = email.trim().toLowerCase();

    const existing = await tx.user.findUnique({ where: { email } });
    if (existing) {
      throw new ApiError(ERROR_CODES.CONFLICT, 'Email already exists');
    }

    const plainPassword = password || this._generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const user = await tx.user.create({
      data: {
        email,
        password_hash: hashedPassword,
        role,
        employee_id: employee_id || null,
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
  }
};
