import { departmentAPI } from './department.api';

describe('departmentAPI feature helpers', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('listDepartments maps response to data and pagination', async () => {
    vi.spyOn(departmentAPI, 'getDepartments').mockResolvedValue({
      data: {
        items: [{ id: 1, name: 'IT' }],
        pagination: { page: 1, limit: 10, total: 1, total_pages: 1 },
      },
    });

    const result = await departmentAPI.listDepartments();

    expect(departmentAPI.getDepartments).toHaveBeenCalledWith({ page: 1, limit: 10, search: '' });
    expect(result).toEqual({
      data: [{ id: 1, name: 'IT' }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
  });

  it('createDepartmentRecord unwraps response data', async () => {
    const payload = { name: 'Finance' };
    vi.spyOn(departmentAPI, 'createDepartment').mockResolvedValue({ data: { id: 1, ...payload } });

    await expect(departmentAPI.createDepartmentRecord(payload)).resolves.toEqual({
      id: 1,
      ...payload,
    });
  });

  it('deleteDepartmentRecord unwraps response data', async () => {
    vi.spyOn(departmentAPI, 'deleteDepartment').mockResolvedValue({ data: { success: true } });

    await expect(departmentAPI.deleteDepartmentRecord(1)).resolves.toEqual({ success: true });
  });
});
