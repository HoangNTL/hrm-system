import { prisma } from '../config/db.js';
import { userService } from './user.service.js';
import ApiError from '../utils/ApiError.js';
import { ERROR_CODES } from '../utils/errorCodes.js';

// standardized select fields for employee
const employeeSelect = {
  id: true,
  full_name: true,
  gender: true,
  dob: true,
  identity_number: true,
  phone: true,
  email: true,
  address: true,
  work_status: true,
  created_at: true,
  updated_at: true,
  department: {
    select: {
      id: true,
      code: true,
      name: true
    }
  },
  position: {
    select: {
      id: true,
      name: true
    }
  },
  user_account: {
    select: {
      id: true,
      email: true,
      role: true
    }
  }
};

export const employeeService = {
  async getAll({ search = '', page = 1, limit = 10, department_id, gender, work_status } = {}) {
    const skip = (page - 1) * limit;

    // Build filter conditions
    const whereConditions = {
      is_deleted: false,
    };

    // Add search filter
    if (search) {
      whereConditions.OR = [
        { full_name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { identity_number: { contains: search } },
      ];
    }

    // Add department filter
    if (department_id !== undefined && department_id !== null && department_id !== '') {
      whereConditions.department_id = Number(department_id);
    }

    // Add gender filter
    if (gender !== undefined && gender !== null && gender !== '') {
      whereConditions.gender = gender;
    }

    // Add work status filter
    if (work_status !== undefined && work_status !== null && work_status !== '') {
      whereConditions.work_status = work_status;
    }

    // Fetch data and total count in parallel
    const [data, total] = await Promise.all([
      prisma.employee.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        select: employeeSelect,
      }),
      prisma.employee.count({ where: whereConditions }),
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
    const employee = await prisma.employee.findUnique({
      where: { id },
      select: employeeSelect,
    });

    if (!employee || employee.is_deleted) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'Employee not found');
    }

    return employee;
  },

  async create(data) {
    const {
      full_name,
      gender,
      dob,
      cccd,
      phone,
      email,
      address,
      department_id,
      position_id,
      create_login = false,
    } = data;

    if (!full_name || !gender || !dob || !cccd) {
      throw new ApiError(
        ERROR_CODES.BAD_REQUEST,
        'Missing required fields: full_name, gender, dob, cccd'
      );
    }

    let dobDate = new Date(dob);
    if (isNaN(dobDate.getTime())) {
      throw new ApiError(
        ERROR_CODES.BAD_REQUEST,
        'Invalid date format for dob. Use YYYY-MM-DD.'
      );
    }

    if (create_login && (!email || !email.trim())) {
      throw new ApiError(
        ERROR_CODES.BAD_REQUEST,
        'Email is required to create login account'
      );
    }

    return await prisma.$transaction(async (tx) => {
      // Create employee
      const employee = await tx.employee.create({
        data: {
          full_name,
          gender,
          dob: dobDate,
          identity_number: cccd,
          phone: phone || null,
          email: email?.trim().toLowerCase() || null,
          address: address || null,
          department_id: department_id || null,
          position_id: position_id || null,
        },
        select: {
          id: true,
          full_name: true,
          gender: true,
          dob: true,
          identity_number: true,
          phone: true,
          email: true,
          address: true,
          department_id: true,
          position_id: true,
          created_at: true,
          updated_at: true,
        },
      });

      // create login account if requested
      let user_account = null;
      let generated_password = null;

      if (create_login && email) {
        const result = await userService.create(
          { email, employee_id: employee.id, role: 'STAFF' },
          tx
        );
        user_account = result.user;
        generated_password = result.password;
      }

      return { employee, user_account, generated_password };
    });
  },

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
      where: { id },
    });

    if (!existing || existing.is_deleted) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'Employee not found');
    }

    const updateData = Object.assign({}, {
      full_name,
      gender,
      phone,
      email,
      address,
      department_id,
      position_id,
      identity_number: cccd,
    });

    // Validate dob
    if (dob !== undefined) {
      const dobDate = new Date(dob);
      if (isNaN(dobDate.getTime())) {
        throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Invalid date format for dob.');
      }
      updateData.dob = dobDate;
    }

    // Remove undefined fields
    for (const key in updateData) {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw new ApiError(ERROR_CODES.BAD_REQUEST, 'No fields to update');
    }

    const updated = await prisma.employee.update({
      where: { id },
      data: updateData,
      select: employeeSelect,
    });

    return updated;
  },

  async delete(id) {
    const existing = await prisma.employee.findUnique({
      where: { id },
    });

    if (!existing || existing.is_deleted) {
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
