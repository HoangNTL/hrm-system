import { shiftAPI } from './shift.api';

describe('shiftAPI feature helpers', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('listShifts maps response to data and pagination', async () => {
    vi.spyOn(shiftAPI, 'getShifts').mockResolvedValue({
      data: {
        items: [{ id: 1, name: 'Morning Shift' }],
        pagination: { page: 1, limit: 10, total: 1, total_pages: 1 },
      },
    });

    const result = await shiftAPI.listShifts();

    expect(shiftAPI.getShifts).toHaveBeenCalledWith({ page: 1, limit: 10, search: '' });
    expect(result).toEqual({
      data: [{ id: 1, name: 'Morning Shift' }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
  });

  it('createShiftRecord unwraps response data', async () => {
    const payload = { name: 'Evening Shift' };
    vi.spyOn(shiftAPI, 'createShift').mockResolvedValue({ data: { id: 1, ...payload } });

    await expect(shiftAPI.createShiftRecord(payload)).resolves.toEqual({
      id: 1,
      ...payload,
    });
  });

  it('deleteShiftRecord unwraps response data', async () => {
    vi.spyOn(shiftAPI, 'deleteShift').mockResolvedValue({ data: { success: true } });

    await expect(shiftAPI.deleteShiftRecord(1)).resolves.toEqual({ success: true });
  });
});
