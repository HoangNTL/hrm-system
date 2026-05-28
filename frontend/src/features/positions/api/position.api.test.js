import { positionAPI } from './position.api';

describe('positionAPI feature helpers', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('listPositions maps response to data and pagination', async () => {
    vi.spyOn(positionAPI, 'getPositions').mockResolvedValue({
      data: {
        items: [{ id: 1, name: 'Developer' }],
        pagination: { page: 1, limit: 100, total: 1, total_pages: 1 },
      },
    });

    const result = await positionAPI.listPositions();

    expect(positionAPI.getPositions).toHaveBeenCalledWith({ page: 1, limit: 100, search: '' });
    expect(result).toEqual({
      data: [{ id: 1, name: 'Developer' }],
      pagination: { page: 1, limit: 100, total: 1, totalPages: 1 },
    });
  });

  it('deletePositionRecord unwraps response data', async () => {
    vi.spyOn(positionAPI, 'deletePosition').mockResolvedValue({ data: { success: true } });

    await expect(positionAPI.deletePositionRecord(1)).resolves.toEqual({ success: true });
  });
});
