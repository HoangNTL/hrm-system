import response from '../utils/response.js';
import { parsePagination } from '../utils/sanitizeQuery.js';
import { employeeService } from '../services/employee.service.js';

// Helper to map Prisma Employee -> frontend shape
const mapEmployee = (e) => {
  if (!e) return null;
  return {
    employee_id: e.id,
    full_name: e.full_name || '',
    gender: e.gender || '',
    dob: e.dob ? (typeof e.dob === 'string' ? e.dob : e.dob.toISOString().split('T')[0]) : null,
    cccd: e.identity_number || '',
    phone: e.phone || '',
    email: e.email || '',
    address: e.address || '',
    department_id: e.department_id || null,
    position_id: e.position_id || null,
    has_account: !!e.user_account,
    account_status: e.user_account ? 'active' : null,
  };
};

/**
 * @route GET /api/employees
 * @desc  Get all employees (with search + pagination)
 * @access Public
 */
export const getEmployees = async (req, res, next) => {
  try {
    const { search, page, limit } = parsePagination(req.query);
    const result = await employeeService.getAll({ page, limit, search });
    return response.success(res, { items: result.data.map(mapEmployee), pagination: result.pagination }, 'Success', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/employees/:id
 * @desc  Get employee by ID
 * @access Public
 */
export const getEmployeeById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return response.fail(res, 400, 'Invalid employee id');
    }
    const employee = await employeeService.getById(id);
    return response.success(res, { employee: mapEmployee(employee) }, 'Success', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/employees
 * @desc  Create a new employee (optionally with account)
 * @access Public
 */
export const createEmployee = async (req, res, next) => {
  try {
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
      auto_create_account,
    } = req.body;

    const { employee, accountInfo } = await employeeService.create({
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
    });

    return response.success(res, { employee: mapEmployee(employee), accountInfo }, 'Created', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @route PUT /api/employees/:id
 * @desc  Update an employee
 * @access Public
 */
export const updateEmployee = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return response.fail(res, 400, 'Invalid employee id');
    }

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
    } = req.body;

    const updated = await employeeService.update(id, {
      full_name,
      gender,
      dob,
      cccd,
      phone,
      email,
      address,
      department_id,
      position_id,
    });

    return response.success(res, { employee: mapEmployee(updated) }, 'Updated', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @route DELETE /api/employees/:id
 * @desc  Delete an employee (soft delete)
 * @access Public
 */
export const deleteEmployee = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return response.fail(res, 400, 'Invalid employee id');
    }

    await employeeService.delete(id);
    return response.success(res, {}, 'Deleted', 200);
  } catch (error) {
    next(error);
  }
};