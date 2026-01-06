import { userService } from '../userService';
import { userAPI } from '@api/userAPI';

vi.mock('@api/userAPI', () => ({
  userAPI: {
    getUsers: vi.fn(),
    resetPassword: vi.fn(),
    toggleLock: vi.fn(),
    getMe: vi.fn(),
    updateMe: vi.fn(),
  },
}));

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUsers', () => {
    it('fetches users with default params', async () => {
      const mockResponse = {
        data: {
          items: [{ id: 1, name: 'John Doe' }],
          pagination: { page: 1, limit: 10, total: 1, total_pages: 1 },
        },
      };
      userAPI.getUsers.mockResolvedValue(mockResponse);

      const result = await userService.getUsers();

      expect(userAPI.getUsers).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(result.data).toEqual([{ id: 1, name: 'John Doe' }]);
      expect(result.pagination.total).toBe(1);
    });

    it('fetches users with search and filters', async () => {
      const mockResponse = {
        data: {
          items: [],
          pagination: { page: 1, limit: 10, total: 0, total_pages: 1 },
        },
      };
      userAPI.getUsers.mockResolvedValue(mockResponse);

      await userService.getUsers({
        page: 2,
        search: 'john',
        role: 'admin',
        status: 'active',
      });

      expect(userAPI.getUsers).toHaveBeenCalledWith({
        page: 2,
        limit: 10,
        search: 'john',
        role: 'admin',
        status: 'active',
      });
    });

    it('throws error from API on failure', async () => {
      const error = { message: 'Network error', status: 500 };
      userAPI.getUsers.mockRejectedValue(error);

      await expect(userService.getUsers()).rejects.toEqual(error);
    });

    it('handles empty response data', async () => {
      userAPI.getUsers.mockResolvedValue({ data: null });

      const result = await userService.getUsers();

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('resetPassword', () => {
    it('resets user password', async () => {
      const mockResponse = { data: { success: true, newPassword: 'temp123' } };
      userAPI.resetPassword.mockResolvedValue(mockResponse);

      const result = await userService.resetPassword(1);

      expect(userAPI.resetPassword).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockResponse.data);
    });

    it('throws error from API on failure', async () => {
      const error = { message: 'Reset failed', status: 403 };
      userAPI.resetPassword.mockRejectedValue(error);

      await expect(userService.resetPassword(1)).rejects.toEqual(error);
    });
  });

  describe('toggleLock', () => {
    it('toggles user lock status', async () => {
      const mockResponse = { data: { id: 1, isLocked: true } };
      userAPI.toggleLock.mockResolvedValue(mockResponse);

      const result = await userService.toggleLock(1);

      expect(userAPI.toggleLock).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockResponse.data);
    });

    it('throws error from API on failure', async () => {
      const error = { message: 'Toggle failed', status: 500 };
      userAPI.toggleLock.mockRejectedValue(error);

      await expect(userService.toggleLock(1)).rejects.toEqual(error);
    });
  });

  describe('getMe', () => {
    it('fetches current user profile', async () => {
      const mockUser = { id: 1, name: 'Current User', email: 'user@example.com' };
      userAPI.getMe.mockResolvedValue({ data: mockUser });

      const result = await userService.getMe();

      expect(userAPI.getMe).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('handles response without data wrapper', async () => {
      const mockUser = { id: 1, name: 'Current User' };
      userAPI.getMe.mockResolvedValue(mockUser);

      const result = await userService.getMe();

      expect(result).toEqual(mockUser);
    });

    it('throws error from API on failure', async () => {
      const error = { message: 'Failed to load profile', status: 401 };
      userAPI.getMe.mockRejectedValue(error);

      await expect(userService.getMe()).rejects.toEqual(error);
    });
  });

  describe('updateMe', () => {
    it('updates current user profile', async () => {
      const payload = { name: 'Updated Name' };
      const mockResponse = { data: { id: 1, ...payload } };
      userAPI.updateMe.mockResolvedValue(mockResponse);

      const result = await userService.updateMe(payload);

      expect(userAPI.updateMe).toHaveBeenCalledWith(payload);
      expect(result).toEqual(mockResponse.data);
    });

    it('handles response without data wrapper', async () => {
      const payload = { name: 'Updated Name' };
      userAPI.updateMe.mockResolvedValue({ id: 1, ...payload });

      const result = await userService.updateMe(payload);

      expect(result).toEqual({ id: 1, ...payload });
    });

    it('throws error from API on failure', async () => {
      const error = { message: 'Update failed', status: 422, errors: { name: ['Invalid'] } };
      userAPI.updateMe.mockRejectedValue(error);

      await expect(userService.updateMe({})).rejects.toEqual(error);
    });
  });
});
