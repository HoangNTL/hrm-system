import response from '../utils/response.js';
import { contractService } from '../services/contract.service.js';
import { parsePagination } from '../utils/sanitizeQuery.js';

/**
 * @route GET /api/contracts
 * @desc  Get all contracts with filters
 */
export const getContracts = async (req, res, next) => {
  try {
    const { search, page, limit } = parsePagination(req.query);
    const { status, type } = req.query;

    const result = await contractService.getAll({
      search,
      status: status || '',
      type: type || '',
      page,
      limit,
    });

    return response.success(res, { items: result.data, pagination: result.pagination }, 'Success', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/contracts/:id
 * @desc  Get contract by ID
 */
export const getContractById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return response.fail(res, 400, 'Invalid contract ID');
    }

    const contract = await contractService.getById(id);
    return response.success(res, { contract }, 'Success', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/contracts
 * @desc  Create a new contract
 */
export const createContract = async (req, res, next) => {
  try {
    const { code, employee_id, contract_type, status, start_date, end_date, salary, work_location, notes } = req.body;

    const created = await contractService.create({
      code,
      employee_id: employee_id ? Number(employee_id) : undefined,
      contract_type,
      status,
      start_date,
      end_date,
      salary,
      work_location,
      notes,
    });

    return response.success(res, { contract: created }, 'Created', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @route PUT /api/contracts/:id
 * @desc  Update a contract
 */
export const updateContract = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return response.fail(res, 400, 'Invalid contract ID');
    }

    const { code, employee_id, contract_type, status, start_date, end_date, salary, work_location, notes } = req.body;

    const updated = await contractService.update(id, {
      code,
      employee_id: employee_id ? Number(employee_id) : undefined,
      contract_type,
      status,
      start_date,
      end_date,
      salary,
      work_location,
      notes,
    });

    return response.success(res, { contract: updated }, 'Updated', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @route DELETE /api/contracts/:id
 * @desc  Delete a contract (soft delete)
 */
export const deleteContract = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return response.fail(res, 400, 'Invalid contract ID');
    }

    const result = await contractService.delete(id);
    return response.success(res, { contract: result }, 'Deleted', 200);
  } catch (error) {
    next(error);
  }
};
