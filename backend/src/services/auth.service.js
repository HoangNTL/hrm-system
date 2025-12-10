import bcrypt from "bcrypt";
import { prisma } from "../config/db.js";
import { tokenService } from "./token.service.js";
import response from "../utils/response.js";

/**
 * Authentication Service
 * Handles login, logout, and refresh token logic.
 */
export const authService = {
    /**
     * Login
     * @param {string} email
     * @param {string} password
     * @returns {Object} Response object
     */
    async login(email, password) {
        if (!email || !password) {
            return response.fail(400, "Email and password are required");
        }

        // find user by email
        const user = await prisma.user.findUnique({
            where: { email },
            include: { employee: true },
        });

        if (!user) return response.unauthorized("Invalid email or password");

        // compare password
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) return response.unauthorized("Invalid email or password");

        // generate tokens
        const accessToken = tokenService.generateAccessToken(user);
        const refreshToken = tokenService.generateRefreshToken(user);

        await this._saveRefreshToken(user.id, refreshToken);

        return response.success({
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                employee: user.employee,
            },
        });
    },

    /**
     * Logout
     * @param {number} userId
     * @returns {Object} Response object
     */
    async logout(userId) {
        if (!userId) return response.unauthorized();

        await this._clearRefreshToken(userId);

        return response.success(null, "Logout successful");
    },

    /**
     * Refresh Token
     * @param {string} refreshTokenCookie
     * @param {number} userId
     * @returns {Object} Response object
     */
    async refreshToken(refreshTokenCookie, userId) {
        let token = refreshTokenCookie;

        // if no token in cookie, try to get from userId
        if (!token) {
            if (!userId) return response.unauthorized("No refresh token");

            const user = await this._findUser(userId);
            if (!user?.refresh_token) return response.fail(403, "Invalid refresh token");

            token = user.refresh_token;
        }

        // verify token
        let payload;
        try {
            payload = tokenService.verifyRefreshToken(token);
        } catch {
            return response.fail(403, "Invalid or expired refresh token");
        }

        const user = await this._findUser(payload.id);
        if (!user) return response.notFound("User not found");

        const accessToken = tokenService.generateAccessToken(user);
        const refreshToken = tokenService.generateRefreshToken(user);

        await this._saveRefreshToken(user.id, refreshToken);

        return response.success({ accessToken, refreshToken }, "Token refreshed");
    },

    // _helpers
    async _saveRefreshToken(userId, refreshToken) {
        await prisma.user.update({
            where: { id: userId },
            data: { refresh_token: refreshToken },
        });
    },

    async _clearRefreshToken(userId) {
        await prisma.user.update({
            where: { id: userId },
            data: { refresh_token: null },
        });
    },

    async _findUser(userId) {
        return await prisma.user.findUnique({ where: { id: userId } });
    }
};
