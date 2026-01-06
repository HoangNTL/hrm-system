import authService from '@/services/authService';
import authAPI from '@/api/authAPI';

vi.mock('@/api/authAPI', () => ({
  default: {
    login: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn(),
    changePassword: vi.fn(),
  },
}));

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('login success stores user and returns user & accessToken', async () => {
    const user = { id: 1, name: 'Test User' };
    const accessToken = 'token123';

    authAPI.login.mockResolvedValue({
      data: { data: { user, accessToken } },
    });

    const result = await authService.login('test@example.com', 'password');

    expect(result).toEqual({ user, accessToken });
    expect(JSON.parse(localStorage.getItem('user'))).toEqual(user);
    expect(authAPI.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });
  });

  it('login failure throws error from API', async () => {
    const error = {
      message: 'Login failed',
      status: 422,
      errors: { email: ['Invalid'] },
    };

    authAPI.login.mockRejectedValue(error);

    await expect(authService.login('x', 'y')).rejects.toEqual(error);
  });

  it('getCurrentUser returns parsed user from localStorage', () => {
    const user = { id: 1, name: 'Stored User' };
    localStorage.setItem('user', JSON.stringify(user));

    expect(authService.getCurrentUser()).toEqual(user);
  });

  it('getCurrentUser returns null when no user in localStorage', () => {
    localStorage.removeItem('user');

    expect(authService.getCurrentUser()).toBeNull();
  });
});
