import { contractService } from '../contractService';
import { contractAPI } from '@api/contractAPI';

vi.mock('@api/contractAPI', () => ({
    contractAPI: {
        getContracts: vi.fn(),
        createContract: vi.fn(),
        updateContract: vi.fn(),
    },
}));

describe('contractService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getContracts', () => {
        it('fetches contracts with default params', async () => {
            const mockResponse = {
                data: {
                    items: [{ id: 1, type: 'Full-time' }],
                    pagination: { page: 1, limit: 10, total: 1, total_pages: 1 },
                },
            };
            contractAPI.getContracts.mockResolvedValue(mockResponse);

            const result = await contractService.getContracts();

            expect(contractAPI.getContracts).toHaveBeenCalledWith({ page: 1, limit: 10 });
            expect(result.data).toEqual([{ id: 1, type: 'Full-time' }]);
            expect(result.pagination.total).toBe(1);
        });

        it('fetches contracts with search and filters', async () => {
            const mockResponse = {
                data: {
                    items: [],
                    pagination: { page: 1, limit: 10, total: 0, total_pages: 1 },
                },
            };
            contractAPI.getContracts.mockResolvedValue(mockResponse);

            await contractService.getContracts({
                page: 2,
                search: 'test',
                status: 'active',
                type: 'Full-time',
                employeeId: '123',
            });

            expect(contractAPI.getContracts).toHaveBeenCalledWith({
                page: 2,
                limit: 10,
                search: 'test',
                status: 'active',
                type: 'Full-time',
                employeeId: '123',
            });
        });

        it('throws error from API on failure', async () => {
            const error = { message: 'Network error', status: 500 };
            contractAPI.getContracts.mockRejectedValue(error);

            await expect(contractService.getContracts()).rejects.toEqual(error);
        });

        it('handles empty response data', async () => {
            contractAPI.getContracts.mockResolvedValue({ data: null });

            const result = await contractService.getContracts();

            expect(result.data).toEqual([]);
            expect(result.pagination.total).toBe(0);
        });
    });

    describe('createContract', () => {
        it('creates a new contract', async () => {
            const contractData = { employeeId: 1, type: 'Full-time' };
            const mockResponse = { data: { id: 1, ...contractData } };
            contractAPI.createContract.mockResolvedValue(mockResponse);

            const result = await contractService.createContract(contractData);

            expect(contractAPI.createContract).toHaveBeenCalledWith(contractData);
            expect(result).toEqual(mockResponse.data);
        });

        it('throws error from API on failure', async () => {
            const error = { message: 'Validation error', status: 422, errors: { type: ['Required'] } };
            contractAPI.createContract.mockRejectedValue(error);

            await expect(contractService.createContract({})).rejects.toEqual(error);
        });
    });

    describe('updateContract', () => {
        it('updates an existing contract', async () => {
            const contractData = { type: 'Part-time' };
            const mockResponse = { data: { id: 1, ...contractData } };
            contractAPI.updateContract.mockResolvedValue(mockResponse);

            const result = await contractService.updateContract(1, contractData);

            expect(contractAPI.updateContract).toHaveBeenCalledWith(1, contractData);
            expect(result).toEqual(mockResponse.data);
        });

        it('throws error from API on failure', async () => {
            const error = { message: 'Update failed', status: 500 };
            contractAPI.updateContract.mockRejectedValue(error);

            await expect(contractService.updateContract(1, {})).rejects.toEqual(error);
        });
    });
});
