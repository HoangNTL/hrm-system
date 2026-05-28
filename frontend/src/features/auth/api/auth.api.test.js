import { authAPI } from './auth.api';

describe('authAPI session helpers', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('loginSession returns user and accessToken', async () => {
    const user = { id: 1, name: 'Test User' };
    const accessToken = 'token123';

    vi.spyOn(authAPI, 'login').mockResolvedValue({
      data: { data: { user, accessToken } },
    });

    const result = await authAPI.loginSession('test@example.com', 'password');

    expect(authAPI.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });
    expect(result).toEqual({ user, accessToken });
  });

  it('loginSession rejects invalid payloads', async () => {
    vi.spyOn(authAPI, 'login').mockResolvedValue({ data: { data: {} } });

    await expect(authAPI.loginSession('test@example.com', 'password')).rejects.toEqual({
      message: 'Invalid login response',
      status: 500,
    });
  });

  it('refreshSession unwraps the refresh payload', async () => {
    vi.spyOn(authAPI, 'refreshToken').mockResolvedValue({
      data: { data: { accessToken: 'next-token', user: { id: 2 } } },
    });

    await expect(authAPI.refreshSession()).resolves.toEqual({
      accessToken: 'next-token',
      user: { id: 2 },
    });
  });
});
