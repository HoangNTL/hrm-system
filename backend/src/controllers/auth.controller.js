import { authService } from '../services/auth.service.js';

// just use HTTPS in production
const cookieOptions = {
  httpOnly: true,
  // secure: process.env.NODE_ENV === 'production',
  secure: true,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    if (!result.ok) {
      return res.status(result.status).json(result);
    }

    // Send refresh token in HttpOnly cookie
    res.cookie('refreshToken', result.data.refreshToken, cookieOptions);

    return res.status(200).json(result);

  } catch (error) {
    console.error("Login Controller Error:", error.message);
    return res.status(500).json({
      ok: false,
      status: 500,
      message: "Internal Server Error",
      data: null,
    });
  }
};

// POST /api/auth/logout
export const logout = async (req, res) => {
  try {
    const userId = req.user?.id; // get user id from middleware verifyToken
    const result = await authService.logout(userId);

    if (!result.ok) {
      return res.status(result.status).json(result);
    }

    // clear cookie refresh token
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 0,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Logout Controller Error:", error);
    return res.status(500).json({
      ok: false,
      status: 500,
      message: "Internal Server error",
      data: null,
    });
  }
};

// POST /api/auth/refresh-token
export const refreshToken = async (req, res) => {
  try {
    // we can use refresh token from cookie or from DB
    // get refresh token from cookie
    const refreshTokenCookie = req.cookies?.refreshToken;
    const userId = req.user?.id; // get user id from middleware verifyToken

    const result = await authService.refreshToken(refreshTokenCookie, userId);

    if (!result.ok) {
      return res.status(result.status).json(result);
    }

    // set new refresh token in cookie if have
    if (result.data.refreshToken) {
      res.cookie('refreshToken', result.data.refreshToken, cookieOptions);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Refresh Token Controller Error:", error);
    return res.status(500).json({
      ok: false,
      status: 500,
      message: "Internal server error",
      data: null,
    });
  }
}


