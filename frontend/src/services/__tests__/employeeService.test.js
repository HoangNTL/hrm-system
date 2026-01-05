import { employeeService } from '@services/employeeService';
import { employeeAPI } from '@api/employeeAPI';

vi.mock('@api/employeeAPI', () => ({
    employeeAPI: {
        getEmployees: vi.fn(),
        getEmployeeById: vi.fn(),
        createEmployee: vi.fn(),
        updateEmployee: vi.fn(),
        deleteEmployee: vi.fn(),
    },
}));

describe('employeeService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('getEmployees maps response to data & pagination', async () => {
        employeeAPI.getEmployees.mockResolvedValue({
            data: {
                items: [{ id: 1, name: 'Emp 1' }],
                pagination: { page: 2, limit: 5, total: 20, total_pages: 4 },
            },
        });

        const result = await employeeService.getEmployees({ page: 2, limit: 5 });

        expect(employeeAPI.getEmployees).toHaveBeenCalledWith({ page: 2, limit: 5 });
        expect(result).toEqual({
            data: [{ id: 1, name: 'Emp 1' }],
            pagination: { page: 2, limit: 5, total: 20, totalPages: 4 },
        });
    });

    it('getEmployees throws normalized error on failure', async () => {
        const error = {
            message: 'Failed to fetch employees',
            status: 500,
            errors: { general: ['error'] },
        };

        employeeAPI.getEmployees.mockRejectedValue(error);

        await expect(employeeService.getEmployees()).rejects.toEqual({
            message: 'Failed to fetch employees',
            status: 500,
            errors: { general: ['error'] },
        });
    });

    it('getEmployeeById returns employee data', async () => {
        employeeAPI.getEmployeeById.mockResolvedValue({
            data: { employee: { id: 1, name: 'Emp 1' } },
        });

        const result = await employeeService.getEmployeeById(1);
        expect(result).toEqual({ id: 1, name: 'Emp 1' });
    });

    it('createEmployee returns response data', async () => {
        const payload = { name: 'New Emp' };
        employeeAPI.createEmployee.mockResolvedValue({ data: { id: 1, ...payload } });

        const result = await employeeService.createEmployee(payload);
        expect(result).toEqual({ id: 1, name: 'New Emp' });
    });

    it('updateEmployee returns response data', async () => {
        const payload = { name: 'Updated Emp' };
        employeeAPI.updateEmployee.mockResolvedValue({ data: { id: 1, ...payload } });

        const result = await employeeService.updateEmployee(1, payload);
        expect(result).toEqual({ id: 1, name: 'Updated Emp' });
    });

    it('deleteEmployee returns response data', async () => {
        employeeAPI.deleteEmployee.mockResolvedValue({ data: { success: true } });

        const result = await employeeService.deleteEmployee(1);
        expect(result).toEqual({ success: true });
    });
});
