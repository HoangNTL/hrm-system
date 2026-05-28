import { userAPI } from './user.api';

describe('userAPI feature helpers', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('listUsers maps paginated user payloads', async () => {
    vi.spyOn(userAPI, 'getUsers').mockResolvedValue({
      data: {
        items: [{ id: 1, email: 'john@example.com' }],
        pagination: { page: 1, limit: 10, total: 1, total_pages: 1 },
      },
    });

    const result = await userAPI.listUsers();

    expect(userAPI.getUsers).toHaveBeenCalledWith({ page: 1, limit: 10 });
    expect(result).toEqual({
      data: [{ id: 1, email: 'john@example.com' }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
  });

  it('resetUserPassword unwraps nested response data', async () => {
    vi.spyOn(userAPI, 'resetPassword').mockResolvedValue({
      data: { success: true, password: 'temp123' },
    });

    await expect(userAPI.resetUserPassword(1)).resolves.toEqual({
      success: true,
      password: 'temp123',
    });
  });

  it('getCurrentUserProfile returns the profile payload', async () => {
    vi.spyOn(userAPI, 'getMe').mockResolvedValue({ data: { id: 1, email: 'user@example.com' } });

    await expect(userAPI.getCurrentUserProfile()).resolves.toEqual({
      id: 1,
      email: 'user@example.com',
    });
  });

  it('updateCurrentUserProfile returns the updated profile payload', async () => {
    const payload = { full_name: 'Updated Name' };
    vi.spyOn(userAPI, 'updateMe').mockResolvedValue({ data: { id: 1, ...payload } });

    await expect(userAPI.updateCurrentUserProfile(payload)).resolves.toEqual({
      id: 1,
      ...payload,
    });
  });
});
