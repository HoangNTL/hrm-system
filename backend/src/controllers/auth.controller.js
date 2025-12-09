import { authService } from '../services/auth.service.js';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // just use HTTPS in production
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    if (!result.ok) {
      return res.status(result.status).json({ message: result.message });
    }

    // Send refresh token in HttpOnly cookie
    res.cookie('refreshToken', result.data.refreshToken, cookieOptions);

    return res.status(200).json(result);

  } catch (error) {
    console.error("Login Controller Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
