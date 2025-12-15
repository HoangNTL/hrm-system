import response from '../utils/response.js';
import { parsePagination } from '../utils/sanitizeQuery.js';
import { employeeService } from '../services/employee.service.js';

/**
 * @route GET /api/employees
 * @desc  Get all employees (with search + pagination + filters)
 * @access Public
 */
export const getEmployees = async (req, res, next) => {
  try {
    const { search, page, limit } = parsePagination(req.query);
    const { department_id, gender, work_status } = req.query;

    const result = await employeeService.getAll({
      page,
      limit,
      search,
      department_id,
      gender,
      work_status,
    });

    return response.success(
      res,
      { items: result.data, pagination: result.pagination },
      'Success',
      200
    );
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
    return response.success(res, { employee }, 'Success', 200);
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
      create_login = false,
    } = req.body;

    // Map service return to userInfo expected by response
    const { employee, user_account, generated_password } = await employeeService.create({
      full_name,
      gender,
      dob,
      cccd,
      phone,
      email,
      address,
      department_id,
      position_id,
      create_login,
    });

    return response.success(res, { employee, user_account, generated_password }, 'Created', 201);
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

    return response.success(res, { employee: updated }, 'Updated', 200);
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

    const result = await employeeService.delete(id);
    return response.success(res, { employee: result }, 'Deleted', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/employees/select/list
 * @desc  Get employees list for select/dropdown (id, name, email)
 * @access Public
 */
export const getEmployeesForSelect = async (req, res, next) => {
  try {
    const employees = await employeeService.getListForSelect();
    return response.success(res, { items: employees }, 'Success', 200);
  } catch (error) {
    next(error);
  }
};
