import { employeeAPI } from './employee.api';

describe('employeeAPI feature helpers', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('listEmployees maps response to data and pagination', async () => {
    vi.spyOn(employeeAPI, 'getEmployees').mockResolvedValue({
      data: {
        items: [{ id: 1, name: 'Emp 1' }],
        pagination: { page: 2, limit: 5, total: 20, total_pages: 4 },
      },
    });

    const result = await employeeAPI.listEmployees({ page: 2, limit: 5 });

    expect(employeeAPI.getEmployees).toHaveBeenCalledWith({ page: 2, limit: 5 });
    expect(result).toEqual({
      data: [{ id: 1, name: 'Emp 1' }],
      pagination: { page: 2, limit: 5, total: 20, totalPages: 4 },
    });
  });

  it('createEmployeeRecord unwraps response data', async () => {
    const payload = { name: 'New Emp' };
    vi.spyOn(employeeAPI, 'createEmployee').mockResolvedValue({ data: { id: 1, ...payload } });

    await expect(employeeAPI.createEmployeeRecord(payload)).resolves.toEqual({
      id: 1,
      ...payload,
    });
  });

  it('deleteEmployeeRecord unwraps response data', async () => {
    vi.spyOn(employeeAPI, 'deleteEmployee').mockResolvedValue({ data: { success: true } });

    await expect(employeeAPI.deleteEmployeeRecord(1)).resolves.toEqual({ success: true });
  });
});
