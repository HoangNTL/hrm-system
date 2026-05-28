import { contractAPI } from './contract.api';

describe('contractAPI feature helpers', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('listContracts maps response to data and pagination', async () => {
    vi.spyOn(contractAPI, 'getContracts').mockResolvedValue({
      data: {
        items: [{ id: 1, type: 'Full-time' }],
        pagination: { page: 1, limit: 10, total: 1, total_pages: 1 },
      },
    });

    const result = await contractAPI.listContracts();

    expect(contractAPI.getContracts).toHaveBeenCalledWith({ page: 1, limit: 10 });
    expect(result).toEqual({
      data: [{ id: 1, type: 'Full-time' }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
  });

  it('createContractRecord unwraps response data', async () => {
    const payload = { employeeId: 1, type: 'Full-time' };
    vi.spyOn(contractAPI, 'createContract').mockResolvedValue({ data: { id: 1, ...payload } });

    await expect(contractAPI.createContractRecord(payload)).resolves.toEqual({
      id: 1,
      ...payload,
    });
  });

  it('updateContractRecord unwraps response data', async () => {
    const payload = { type: 'Part-time' };
    vi.spyOn(contractAPI, 'updateContract').mockResolvedValue({ data: { id: 1, ...payload } });

    await expect(contractAPI.updateContractRecord(1, payload)).resolves.toEqual({
      id: 1,
      ...payload,
    });
  });
});
