import { departmentService } from '../departmentService';
import { departmentAPI } from '@api/departmentAPI';

vi.mock('@api/departmentAPI', () => ({
    departmentAPI: {
        getDepartments: vi.fn(),
        createDepartment: vi.fn(),
        updateDepartment: vi.fn(),
        deleteDepartment: vi.fn(),
    },
}));

describe('departmentService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getDepartments', () => {
        it('fetches departments with default params', async () => {
            const mockResponse = {
                data: {
                    items: [{ id: 1, name: 'IT' }],
                    pagination: { page: 1, limit: 10, total: 1, total_pages: 1 },
                },
            };
            departmentAPI.getDepartments.mockResolvedValue(mockResponse);

            const result = await departmentService.getDepartments();

            expect(departmentAPI.getDepartments).toHaveBeenCalledWith({ page: 1, limit: 10, search: '' });
            expect(result.data).toEqual([{ id: 1, name: 'IT' }]);
            expect(result.pagination.total).toBe(1);
        });

        it('fetches departments with search', async () => {
            const mockResponse = {
                data: {
                    items: [{ id: 2, name: 'HR' }],
                    pagination: { page: 1, limit: 10, total: 1, total_pages: 1 },
                },
            };
            departmentAPI.getDepartments.mockResolvedValue(mockResponse);

            const result = await departmentService.getDepartments({ search: 'HR' });

            expect(departmentAPI.getDepartments).toHaveBeenCalledWith({
                page: 1,
                limit: 10,
                search: 'HR',
            });
            expect(result.data).toEqual([{ id: 2, name: 'HR' }]);
        });

        it('throws error from API on failure', async () => {
            const error = { message: 'Network error', status: 500 };
            departmentAPI.getDepartments.mockRejectedValue(error);

            await expect(departmentService.getDepartments()).rejects.toEqual(error);
        });

        it('handles empty response data', async () => {
            departmentAPI.getDepartments.mockResolvedValue({ data: null });

            const result = await departmentService.getDepartments();

            expect(result.data).toEqual([]);
            expect(result.pagination.total).toBe(0);
        });
    });

    describe('createDepartment', () => {
        it('creates a new department', async () => {
            const departmentData = { name: 'Finance', description: 'Finance department' };
            const mockResponse = { data: { id: 1, ...departmentData } };
            departmentAPI.createDepartment.mockResolvedValue(mockResponse);

            const result = await departmentService.createDepartment(departmentData);

            expect(departmentAPI.createDepartment).toHaveBeenCalledWith(departmentData);
            expect(result).toEqual(mockResponse.data);
        });

        it('throws error from API on failure', async () => {
            const error = { message: 'Validation error', status: 422, errors: { name: ['Required'] } };
            departmentAPI.createDepartment.mockRejectedValue(error);

            await expect(departmentService.createDepartment({})).rejects.toEqual(error);
        });
    });

    describe('updateDepartment', () => {
        it('updates an existing department', async () => {
            const departmentData = { name: 'Updated IT' };
            const mockResponse = { data: { id: 1, ...departmentData } };
            departmentAPI.updateDepartment.mockResolvedValue(mockResponse);

            const result = await departmentService.updateDepartment(1, departmentData);

            expect(departmentAPI.updateDepartment).toHaveBeenCalledWith(1, departmentData);
            expect(result).toEqual(mockResponse.data);
        });

        it('throws error from API on failure', async () => {
            const error = { message: 'Update failed', status: 500 };
            departmentAPI.updateDepartment.mockRejectedValue(error);

            await expect(departmentService.updateDepartment(1, {})).rejects.toEqual(error);
        });
    });

    describe('deleteDepartment', () => {
        it('deletes a department', async () => {
            const mockResponse = { data: { success: true } };
            departmentAPI.deleteDepartment.mockResolvedValue(mockResponse);

            const result = await departmentService.deleteDepartment(1);

            expect(departmentAPI.deleteDepartment).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockResponse.data);
        });

        it('throws error from API on failure', async () => {
            const error = { message: 'Delete failed', status: 403 };
            departmentAPI.deleteDepartment.mockRejectedValue(error);

            await expect(departmentService.deleteDepartment(1)).rejects.toEqual(error);
        });
    });
});
