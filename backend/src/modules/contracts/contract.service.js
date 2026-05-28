import ApiError from '../../utils/ApiError.js';
import { ERROR_CODES } from '../../utils/errorCodes.js';
import { contractRepository } from './contract.repository.js';

const mapContract = (contract) => {
  if (!contract) return null;
  return {
    id: contract.id,
    code: contract.code,
    contract_type: contract.contract_type,
    status: contract.status,
    start_date: contract.start_date?.toISOString().split('T')[0],
    end_date: contract.end_date?.toISOString().split('T')[0] || null,
    salary: contract.salary ? Number(contract.salary) : null,
    work_location: contract.work_location,
    notes: contract.notes,
    employee_id: contract.employee?.id,
    employee_name: contract.employee?.full_name,
    employee_email: contract.employee?.email,
    employee_phone: contract.employee?.phone,
    department_name: contract.employee?.department?.name,
    position_name: contract.employee?.position?.name,
    created_at: contract.created_at,
    updated_at: contract.updated_at,
  };
};

export const contractService = {
  async getAll({ search = '', status = '', type = '', employeeId = null, page = 1, limit = 10 } = {}) {
    const skip = (page - 1) * limit;
    const where = { is_deleted: false };

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { employee: { full_name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) where.status = status;
    if (type) where.contract_type = type;
    if (employeeId) where.employee_id = employeeId;

    const [data, total] = await Promise.all([
      contractRepository.findMany({ where, skip, take: limit }),
      contractRepository.count(where),
    ]);

    return {
      data: data.map(mapContract),
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.max(Math.ceil(total / limit), 1),
      },
    };
  },

  async getById(id) {
    const contract = await contractRepository.findActiveById(id);
    if (!contract) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'Contract not found');
    }
    return mapContract(contract);
  },

  async create({ code, employee_id, contract_type, status, start_date, end_date, salary, work_location, notes }) {
    if (!code || !String(code).trim()) {
      throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Contract code is required');
    }
    if (!employee_id || !Number.isInteger(employee_id) || employee_id <= 0) {
      throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Valid employee ID is required');
    }
    if (!contract_type) {
      throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Contract type is required');
    }
    if (!start_date) {
      throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Start date is required');
    }

    const employee = await contractRepository.findEmployeeById(employee_id);
    if (!employee || employee.is_deleted) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'Employee not found');
    }

    const trimmedCode = String(code).trim();
    const existing = await contractRepository.findByCode(trimmedCode);
    if (existing) {
      throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Contract code already exists');
    }

    const contract = await contractRepository.create({
      code: trimmedCode,
      employee_id,
      contract_type,
      status: status || 'draft',
      start_date: new Date(start_date),
      end_date: end_date ? new Date(end_date) : null,
      salary: salary ? Number(salary) : null,
      work_location: work_location || null,
      notes: notes || null,
    });

    return mapContract(contract);
  },

  async update(id, { code, employee_id, contract_type, status, start_date, end_date, salary, work_location, notes }) {
    const existing = await contractRepository.findRawById(id);
    if (!existing || existing.is_deleted) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'Contract not found');
    }

    const data = {};

    if (code !== undefined) {
      const trimmed = String(code).trim();
      if (!trimmed) {
        throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Contract code cannot be empty');
      }
      if (trimmed !== existing.code) {
        const duplicate = await contractRepository.findByCode(trimmed);
        if (duplicate) {
          throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Contract code already exists');
        }
      }
      data.code = trimmed;
    }

    if (employee_id !== undefined) {
      if (!Number.isInteger(employee_id) || employee_id <= 0) {
        throw new ApiError(ERROR_CODES.BAD_REQUEST, 'Invalid employee ID');
      }
      const employee = await contractRepository.findEmployeeById(employee_id);
      if (!employee || employee.is_deleted) {
        throw new ApiError(ERROR_CODES.NOT_FOUND, 'Employee not found');
      }
      data.employee_id = employee_id;
    }

    if (contract_type !== undefined) data.contract_type = contract_type;
    if (status !== undefined) data.status = status;
    if (start_date !== undefined) data.start_date = new Date(start_date);
    if (end_date !== undefined) data.end_date = end_date ? new Date(end_date) : null;
    if (salary !== undefined) data.salary = salary ? Number(salary) : null;
    if (work_location !== undefined) data.work_location = work_location || null;
    if (notes !== undefined) data.notes = notes || null;

    if (Object.keys(data).length === 0) {
      throw new ApiError(ERROR_CODES.BAD_REQUEST, 'No fields to update');
    }

    const updated = await contractRepository.updateById(id, data);
    return mapContract(updated);
  },

  async delete(id) {
    const existing = await contractRepository.findRawById(id);
    if (!existing || existing.is_deleted) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, 'Contract not found');
    }

    await contractRepository.softDeleteById(id);
    return { id };
  },
};
