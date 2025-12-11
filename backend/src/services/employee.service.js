import { prisma } from '../config/db.js';
import * as userService from './user.service.js';
import ApiError from '../utils/apiError.js';
import { ERROR_CODES } from '../utils/errorCodes.js';

/**
 * Helper function to map employee data
 */
const mapEmployee = (employee) => ({
  id: employee.id,
  full_name: employee.full_name,
  gender: employee.gender,
  dob: employee.dob,
  identity_number: employee.identity_number,
  email: employee.email,
  phone: employee.phone,
  address: employee.address,
  department_id: employee.department_id,
  position_id: employee.position_id,
  user_account: employee.user_account,
  created_at: employee.created_at,
  updated_at: employee.updated_at,
});

/**
 * Employee Service
 * Handles business logic related to employees.
 */
export const employeeService = {
  /**
   * Get all employees (with search + pagination)
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
      ? {
          OR: [
            { full_name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search } },
            { identity_number: { contains: search } },
          ],
          is_deleted: false,
        }
      : { is_deleted: false };

    // Fetch data and total count in parallel
    const [data, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: {
          user_account: {
            select: { id: true, email: true },
          },
        },
      }),
      prisma.employee.count({ where }),
    ]);

    return {
      data: data.map(mapEmployee),
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.max(Math.ceil(total / limit), 1),
      },
    };
  },

  /**
   * Get a single employee by id
   * @param {number} id
   * @returns {Object} Response object
   */
  async getById(id) {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        user_account: {
          select: { id: true, email: true },
        },
      },
    });

    if (!employee || employee.is_deleted) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'Employee not found');
    }

    return mapEmployee(employee);
  },

  /**
   * Create a new employee
   * @param {Object} payload
   */
  async create({
    full_name,
    gender,
    dob,
    cccd,
    phone,
    email,
    address,
    department_id,
    position_id,
    auto_create_account,
  }) {
    // Validate required fields
    if (!full_name || !gender || !dob || !cccd) {
      throw new ApiError(
        ERROR_CODES.BAD_REQUEST,
        'Missing required fields: full_name, gender, dob, cccd'
      );
    }

    // Parse and validate date
    let dobDate = null;
    if (dob) {
      dobDate = new Date(dob);
      if (isNaN(dobDate.getTime())) {
        throw new ApiError(
          ERROR_CODES.BAD_REQUEST,
          'Invalid date format for dob. Use YYYY-MM-DD.'
        );
      }
    }

    const employee = await prisma.employee.create({
      data: {
        full_name,
        gender,
        dob: dobDate,
        identity_number: cccd,
        phone: phone || null,
        email: email || null,
        address: address || null,
        department_id: department_id || null,
        position_id: position_id || null,
      },
      include: {
        user_account: {
          select: { id: true, email: true },
        },
      },
    });

    // Auto-create user account if requested
    let accountInfo = null;
    if (auto_create_account && email) {
      try {
        accountInfo = await userService.createUserAccount({
          email,
          employee_id: employee.id,
          role: 'STAFF',
        });
      } catch (error) {
        // Log error but don't fail employee creation
        console.error('Error creating user account:', error.message);
        accountInfo = { error: error.message };
      }
    }

    return { employee: mapEmployee(employee), accountInfo };
  },

  /**
   * Update an employee by id
   * @param {number} id
   * @param {Object} payload
   */
  async update(id, {
    full_name,
    gender,
    dob,
    cccd,
    phone,
    email,
    address,
    department_id,
    position_id,
  }) {
    const existing = await prisma.employee.findUnique({
      where: { id, is_deleted: false },
    });

    if (!existing) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'Employee not found');
    }

    const updateData = {};
    if (full_name !== undefined) updateData.full_name = full_name;
    if (gender !== undefined) updateData.gender = gender;
    if (dob !== undefined) {
      const dobDate = new Date(dob);
      if (isNaN(dobDate.getTime())) {
        throw new ApiError(
          ERROR_CODES.BAD_REQUEST,
          'Invalid date format for dob.'
        );
      }
      updateData.dob = dobDate;
    }
    if (cccd !== undefined) updateData.identity_number = cccd;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (address !== undefined) updateData.address = address;
    if (department_id !== undefined) updateData.department_id = department_id;
    if (position_id !== undefined) updateData.position_id = position_id;

    if (Object.keys(updateData).length === 0) {
      throw new ApiError(ERROR_CODES.BAD_REQUEST, 'No fields to update');
    }

    const updated = await prisma.employee.update({
      where: { id },
      data: updateData,
      include: {
        user_account: {
          select: { id: true, email: true },
        },
      },
    });

    return mapEmployee(updated);
  },

  /**
   * Delete an employee by id (soft delete)
   * @param {number} id
   */
  async delete(id) {
    const existing = await prisma.employee.findUnique({
      where: { id, is_deleted: false },
    });

    if (!existing) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'Employee not found');
    }

    // Soft delete
    await prisma.employee.update({
      where: { id },
      data: { is_deleted: true, deleted_at: new Date() },
    });

    return { id };
  },
};
