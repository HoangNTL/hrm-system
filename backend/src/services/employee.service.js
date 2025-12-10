import { prisma } from '../config/db.js';
import * as userService from './user.service.js';

export const getEmployees = async ({ page = 1, limit = 10, search = '' } = {}) => {
  const where = {};

  if (search) {
    where.OR = [
      { full_name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
      { identity_number: { contains: search } },
    ];
  }

  const total = await prisma.employee.count({ where });
  const data = await prisma.employee.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { id: 'desc' },
    include: {
      user_account: {
        select: { id: true, email: true },
      },
    },
  });

  return { data, total, page, limit };
};

export const getEmployeeById = async (id) => {
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      user_account: {
        select: { id: true, email: true },
      },
    },
  });
  if (!employee) {
    throw new Error('Employee not found');
  }
  return employee;
};

export const createEmployee = async ({ full_name, gender, dob, cccd, phone, email, address, department_id, position_id, auto_create_account = false }) => {
  // Validate required fields
  if (!full_name || !gender || !dob || !cccd) {
    throw new Error('Missing required fields: full_name, gender, dob, cccd');
  }

  // Parse and validate date
  let dobDate = null;
  if (dob) {
    dobDate = new Date(dob);
    if (isNaN(dobDate.getTime())) {
      throw new Error('Invalid date format for dob. Use YYYY-MM-DD.');
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

  return { employee, accountInfo };
};

export const updateEmployee = async (id, { full_name, gender, dob, cccd, phone, email, address, department_id, position_id }) => {
  const employee = await prisma.employee.findUnique({ where: { id } });
  if (!employee) {
    throw new Error('Employee not found');
  }

  const updateData = {};
  if (full_name !== undefined) updateData.full_name = full_name;
  if (gender !== undefined) updateData.gender = gender;
  if (dob !== undefined) {
    const dobDate = new Date(dob);
    if (isNaN(dobDate.getTime())) {
      throw new Error('Invalid date format for dob.');
    }
    updateData.dob = dobDate;
  }
  if (cccd !== undefined) updateData.identity_number = cccd;
  if (phone !== undefined) updateData.phone = phone;
  if (email !== undefined) updateData.email = email;
  if (address !== undefined) updateData.address = address;
  if (department_id !== undefined) updateData.department_id = department_id;
  if (position_id !== undefined) updateData.position_id = position_id;

  const updated = await prisma.employee.update({
    where: { id },
    data: updateData,
  });

  return updated;
};

export const deleteEmployee = async (id) => {
  const employee = await prisma.employee.findUnique({ where: { id } });
  if (!employee) {
    throw new Error('Employee not found');
  }

  await prisma.employee.delete({ where: { id } });
  return true;
};
