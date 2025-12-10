import { authService } from "../services/auth.service.js";
import response from "../utils/response.js";

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

/**
 * @route   POST /api/auth/login
 * @desc    User login
 * @access  Public
 * @returns {Object} accessToken, refreshToken, user info
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    if (!result.ok) {
      return res.status(result.status).json(result);
    }

    // set refresh token in cookie
    res.cookie("refreshToken", result.data.refreshToken, cookieOptions);

    return res.json(result);
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json(response.serverError());
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    User logout
 * @access  Public
 * @returns {Object} message
 */
export const logout = async (req, res) => {
  try {
    const result = await authService.logout(req.user?.id);

    if (!result.ok) {
      return res.status(result.status).json(result);
    }

    res.clearCookie("refreshToken", { ...cookieOptions, maxAge: 0 });

    return res.json(result);
  } catch (error) {
    console.error("Logout error:", error.message);

    return res.status(500).json(response.serverError());
  }
};

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public
 * @returns {Object} accessToken, refreshToken
 */
export const refreshToken = async (req, res) => {
  try {
    const result = await authService.refreshToken(
      req.cookies?.refreshToken,
      req.user?.id
    );

    if (!result.ok) {
      return res.status(result.status).json(result);
    }

    // set new refresh token in cookie if provided
    if (result.data.refreshToken) {
      res.cookie("refreshToken", result.data.refreshToken, cookieOptions);
    }

    return res.json(result);
  } catch (error) {
    console.error("Logout error:", error.message);

    return res.status(500).json(response.serverError());
  }
};