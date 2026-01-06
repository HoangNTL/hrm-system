import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock contract service
vi.mock('../../src/services/contract.service.js', () => ({
    contractService: {
        getAll: vi.fn(),
        getById: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
}));

// Mock response utility
vi.mock('../../src/utils/response.js', () => ({
    default: {
        success: vi.fn((res, data, message, status) => {
            res.status(status).json({ ok: true, status, message, data });
            return res;
        }),
        fail: vi.fn((res, status, message, errors) => {
            res.status(status).json({ ok: false, status, message, errors, data: null });
            return res;
        }),
    },
}));

// Mock sanitizeQuery
vi.mock('../../src/utils/sanitizeQuery.js', () => ({
    parsePagination: vi.fn((query) => ({
        search: query.search || '',
        page: parseInt(query.page) || 1,
        limit: parseInt(query.limit) || 10,
    })),
}));

import { contractService } from '../../src/services/contract.service.js';
import response from '../../src/utils/response.js';
import {
    getContracts,
    getContractById,
    createContract,
    updateContract,
    deleteContract,
} from '../../src/controllers/contract.controller.js';
import ApiError from '../../src/utils/ApiError.js';
import { ERROR_CODES } from '../../src/utils/errorCodes.js';

// Mock request, response, next
const mockRequest = (query = {}, body = {}, params = {}) => ({
    query,
    body,
    params,
});

const mockResponse = () => {
    const res = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

const mockNext = vi.fn();

beforeEach(() => {
    vi.clearAllMocks();
});

describe('Contract Controller', () => {
    describe('getContracts', () => {
        it('should get all contracts with pagination and filters', async () => {
            const req = mockRequest({
                search: 'CT001',
                page: '1',
                limit: '10',
                status: 'active',
                type: 'full_time',
                employeeId: '1',
            });
            const res = mockResponse();

            const serviceResult = {
                data: [
                    { id: 1, code: 'CT001', contract_type: 'full_time', status: 'active' },
                    { id: 2, code: 'CT002', contract_type: 'part_time', status: 'active' },
                ],
                pagination: { total: 2, page: 1, limit: 10 },
            };

            contractService.getAll.mockResolvedValue(serviceResult);

            await getContracts(req, res, mockNext);

            expect(contractService.getAll).toHaveBeenCalledWith({
                search: 'CT001',
                status: 'active',
                type: 'full_time',
                employeeId: 1,
                page: 1,
                limit: 10,
            });
            expect(response.success).toHaveBeenCalledWith(
                res,
                { items: serviceResult.data, pagination: serviceResult.pagination },
                'Success',
                200
            );
        });

        it('should handle empty query parameters', async () => {
            const req = mockRequest({});
            const res = mockResponse();

            const serviceResult = { data: [], pagination: { total: 0, page: 1, limit: 10 } };
            contractService.getAll.mockResolvedValue(serviceResult);

            await getContracts(req, res, mockNext);

            expect(contractService.getAll).toHaveBeenCalledWith({
                search: '',
                status: '',
                type: '',
                employeeId: null,
                page: 1,
                limit: 10,
            });
            expect(response.success).toHaveBeenCalled();
        });

        it('should call next with error when service fails', async () => {
            const req = mockRequest({});
            const res = mockResponse();

            const error = new Error('Database error');
            contractService.getAll.mockRejectedValue(error);

            await getContracts(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('getContractById', () => {
        it('should get contract by id successfully', async () => {
            const req = mockRequest({}, {}, { id: '1' });
            const res = mockResponse();

            const contract = {
                id: 1,
                code: 'CT001',
                contract_type: 'full_time',
                status: 'active',
                employee: { id: 1, full_name: 'John Doe' },
            };
            contractService.getById.mockResolvedValue(contract);

            await getContractById(req, res, mockNext);

            expect(contractService.getById).toHaveBeenCalledWith(1);
            expect(response.success).toHaveBeenCalledWith(res, { contract }, 'Success', 200);
        });

        it('should return fail response for invalid contract id', async () => {
            const req = mockRequest({}, {}, { id: 'invalid' });
            const res = mockResponse();

            await getContractById(req, res, mockNext);

            expect(response.fail).toHaveBeenCalledWith(res, 400, 'Invalid contract ID');
            expect(contractService.getById).not.toHaveBeenCalled();
        });

        it('should return fail response for negative id', async () => {
            const req = mockRequest({}, {}, { id: '-1' });
            const res = mockResponse();

            await getContractById(req, res, mockNext);

            expect(response.fail).toHaveBeenCalledWith(res, 400, 'Invalid contract ID');
        });

        it('should return fail response for zero id', async () => {
            const req = mockRequest({}, {}, { id: '0' });
            const res = mockResponse();

            await getContractById(req, res, mockNext);

            expect(response.fail).toHaveBeenCalledWith(res, 400, 'Invalid contract ID');
        });

        it('should call next with error when contract not found', async () => {
            const req = mockRequest({}, {}, { id: '999' });
            const res = mockResponse();

            const error = new ApiError(ERROR_CODES.NOT_FOUND, 'Contract not found');
            contractService.getById.mockRejectedValue(error);

            await getContractById(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('createContract', () => {
        it('should create contract successfully', async () => {
            const req = mockRequest({}, {
                code: 'CT003',
                employee_id: 1,
                contract_type: 'full_time',
                status: 'active',
                start_date: '2026-01-01',
                end_date: '2027-01-01',
                salary: 15000000,
                work_location: 'HCM Office',
                notes: 'New employee contract',
            });
            const res = mockResponse();

            const createdContract = {
                id: 3,
                code: 'CT003',
                employee_id: 1,
                contract_type: 'full_time',
                status: 'active',
            };

            contractService.create.mockResolvedValue(createdContract);

            await createContract(req, res, mockNext);

            expect(contractService.create).toHaveBeenCalledWith({
                code: 'CT003',
                employee_id: 1,
                contract_type: 'full_time',
                status: 'active',
                start_date: '2026-01-01',
                end_date: '2027-01-01',
                salary: 15000000,
                work_location: 'HCM Office',
                notes: 'New employee contract',
            });
            expect(response.success).toHaveBeenCalledWith(res, { contract: createdContract }, 'Created', 201);
        });

        it('should create contract without employee_id', async () => {
            const req = mockRequest({}, {
                code: 'CT004',
                contract_type: 'full_time',
                status: 'draft',
            });
            const res = mockResponse();

            const createdContract = { id: 4, code: 'CT004' };
            contractService.create.mockResolvedValue(createdContract);

            await createContract(req, res, mockNext);

            expect(contractService.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    code: 'CT004',
                    employee_id: undefined,
                })
            );
        });

        it('should call next with error when contract code already exists', async () => {
            const req = mockRequest({}, { code: 'EXISTING' });
            const res = mockResponse();

            const error = new ApiError(ERROR_CODES.CONFLICT, 'Contract code already exists');
            contractService.create.mockRejectedValue(error);

            await createContract(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });

        it('should call next with error when required fields are missing', async () => {
            const req = mockRequest({}, {});
            const res = mockResponse();

            const error = new ApiError(ERROR_CODES.BAD_REQUEST, 'Contract code is required');
            contractService.create.mockRejectedValue(error);

            await createContract(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('updateContract', () => {
        it('should update contract successfully', async () => {
            const req = mockRequest({}, {
                code: 'CT001-UPD',
                employee_id: 2,
                contract_type: 'part_time',
                status: 'expired',
                start_date: '2025-01-01',
                end_date: '2026-01-01',
                salary: 20000000,
                work_location: 'HN Office',
                notes: 'Updated contract',
            }, { id: '1' });
            const res = mockResponse();

            const updatedContract = {
                id: 1,
                code: 'CT001-UPD',
                contract_type: 'part_time',
                status: 'expired',
            };

            contractService.update.mockResolvedValue(updatedContract);

            await updateContract(req, res, mockNext);

            expect(contractService.update).toHaveBeenCalledWith(1, {
                code: 'CT001-UPD',
                employee_id: 2,
                contract_type: 'part_time',
                status: 'expired',
                start_date: '2025-01-01',
                end_date: '2026-01-01',
                salary: 20000000,
                work_location: 'HN Office',
                notes: 'Updated contract',
            });
            expect(response.success).toHaveBeenCalledWith(res, { contract: updatedContract }, 'Updated', 200);
        });

        it('should return fail response for invalid contract id', async () => {
            const req = mockRequest({}, { code: 'Test' }, { id: 'invalid' });
            const res = mockResponse();

            await updateContract(req, res, mockNext);

            expect(response.fail).toHaveBeenCalledWith(res, 400, 'Invalid contract ID');
            expect(contractService.update).not.toHaveBeenCalled();
        });

        it('should return fail response for negative id', async () => {
            const req = mockRequest({}, { code: 'Test' }, { id: '-5' });
            const res = mockResponse();

            await updateContract(req, res, mockNext);

            expect(response.fail).toHaveBeenCalledWith(res, 400, 'Invalid contract ID');
        });

        it('should call next with error when contract not found', async () => {
            const req = mockRequest({}, { code: 'Test' }, { id: '999' });
            const res = mockResponse();

            const error = new ApiError(ERROR_CODES.NOT_FOUND, 'Contract not found');
            contractService.update.mockRejectedValue(error);

            await updateContract(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('deleteContract', () => {
        it('should delete contract successfully', async () => {
            const req = mockRequest({}, {}, { id: '1' });
            const res = mockResponse();

            const deletedContract = { id: 1, code: 'CT001' };
            contractService.delete.mockResolvedValue(deletedContract);

            await deleteContract(req, res, mockNext);

            expect(contractService.delete).toHaveBeenCalledWith(1);
            expect(response.success).toHaveBeenCalledWith(res, { contract: deletedContract }, 'Deleted', 200);
        });

        it('should return fail response for invalid contract id', async () => {
            const req = mockRequest({}, {}, { id: 'abc' });
            const res = mockResponse();

            await deleteContract(req, res, mockNext);

            expect(response.fail).toHaveBeenCalledWith(res, 400, 'Invalid contract ID');
            expect(contractService.delete).not.toHaveBeenCalled();
        });

        it('should return fail response for zero id', async () => {
            const req = mockRequest({}, {}, { id: '0' });
            const res = mockResponse();

            await deleteContract(req, res, mockNext);

            expect(response.fail).toHaveBeenCalledWith(res, 400, 'Invalid contract ID');
        });

        it('should call next with error when contract not found', async () => {
            const req = mockRequest({}, {}, { id: '999' });
            const res = mockResponse();

            const error = new ApiError(ERROR_CODES.NOT_FOUND, 'Contract not found');
            contractService.delete.mockRejectedValue(error);

            await deleteContract(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
});
