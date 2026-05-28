import ApiError from '../../utils/ApiError.js';
import { ERROR_CODES } from '../../utils/errorCodes.js';
import { userService } from '../users/user.service.js';
import { employeeRepository } from './employee.repository.js';

export const employeeService = {
  async getAll({ search = '', page = 1, limit = 10, department_id, gender, work_status } = {}) {
    const skip = (page - 1) * limit;
    const where = { is_deleted: false };

    if (search) {
      where.OR = [
        { full_name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { identity_number: { contains: search } },
      ];
    }

    if (department_id !== undefined && department_id !== null && department_id !== '') {
      where.department_id = Number(department_id);
    }

    if (gender !== undefined && gender !== null && gender !== '') {
      where.gender = gender;
    }

    if (work_status !== undefined && work_status !== null && work_status !== '') {
      where.work_status = work_status;
    }

    const [data, total] = await Promise.all([
      employeeRepository.findMany({ where, skip, take: limit }),
      employeeRepository.count(where),
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

  async getListForSelect() {
    return employeeRepository.findSelectList({ is_deleted: false });
  },

  async getListForSelectWithoutUser() {
    return employeeRepository.findSelectList({
      is_deleted: false,
      user_account: null,
    });
  },

  async getListForSelectWithUser() {
    return employeeRepository.findSelectList({
      is_deleted: false,
      user_account: { isNot: null },
    });
  },

  async getById(id) {
    const employee = await employeeRepository.findActiveById(id);
    if (!employee) {
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
        'Missing required fields: full_name, gender, dob, cccd',
      );
    }

    const dobDate = new Date(dob);
    if (Number.isNaN(dobDate.getTime())) {
      throw new ApiError(
        ERROR_CODES.BAD_REQUEST,
        'Invalid date format for dob. Use YYYY-MM-DD.',
      );
    }

    if (create_login && (!email || !email.trim())) {
      throw new ApiError(
        ERROR_CODES.BAD_REQUEST,
        'Email is required to create login account',
      );
    }

    return employeeRepository.transaction(async (tx) => {
      const employee = await employeeRepository.create({
        full_name,
        gender,
        dob: dobDate,
        identity_number: cccd,
        phone: phone || null,
        email: email?.trim().toLowerCase() || null,
        address: address || null,
        department_id: department_id || null,
        position_id: position_id || null,
      }, tx);

      let user_account = null;
      let generated_password = null;

      if (create_login && email) {
        const result = await userService.create(
          { email, employee_id: employee.id, role: 'STAFF' },
          tx,
        );
        user_account = result.user;
        generated_password = result.password;
      }

      return { employee, user_account, generated_password };
    });
  },

  async update(id, data) {
    const existing = await employeeRepository.findRawById(id);
    if (!existing || existing.is_deleted) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'Employee not found');
    }

    const updateData = {
      full_name: data.full_name,
      gender: data.gender,
      phone: data.phone,
      email: data.email,
      address: data.address,
      department_id: data.department_id,
      position_id: data.position_id,
      identity_number: data.cccd,
    };

    if (data.dob !== undefined) {
      const dobDate = new Date(data.dob);
      if (Number.isNaN(dobDate.getTime())) {
        throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Invalid date format for dob.');
      }
      updateData.dob = dobDate;
    }

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    if (Object.keys(updateData).length === 0) {
      throw new ApiError(ERROR_CODES.BAD_REQUEST, 'No fields to update');
    }

    return employeeRepository.updateById(id, updateData);
  },

  async delete(id) {
    return employeeRepository.transaction(async (tx) => {
      const existing = await employeeRepository.findRawById(id, tx);
      if (!existing || existing.is_deleted) {
        throw new ApiError(ERROR_CODES.NOT_FOUND, 'Employee not found');
      }

      const deletedAt = new Date();
      await employeeRepository.softDeleteById(id, deletedAt, tx);

      const linkedUser = await employeeRepository.findLinkedActiveUser(id, tx);
      if (linkedUser) {
        await employeeRepository.softDeleteLinkedUser(linkedUser.id, deletedAt, tx);
      }

      return { id, user_deleted: !!linkedUser };
    });
  },
};
