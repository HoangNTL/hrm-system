import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { prisma } from '../config/db.js';

export const authService = {
    async login(email, password) {
        try {
            // Validate input
            if (!email || !password) {
                return {
                    ok: false,
                    status: 400,
                    message: "Email and password are required",
                    data: null,
                };
            }

            // Find user
            const user = await prisma.user.findUnique({
                where: { email },
                include: { employee: true },
            });

            if (!user) {
                return {
                    ok: false,
                    status: 401,
                    message: "Invalid email or password",
                    data: null,
                };
            }

            // Validate password
            const isValid = await bcrypt.compare(password, user.password_hash);

            if (!isValid) {
                return {
                    ok: false,
                    status: 401,
                    message: "Invalid email or password",
                    data: null,
                };
            }

            // Generate tokens
            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            // Save refresh token in DB
            await saveRefreshToken(user.id, refreshToken);

            return {
                ok: true,
                status: 200,
                message: "Login success",
                data: { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role, employee: user.employee } }
            };

        } catch (error) {
            console.error("Login Service Error:", error.message);
            return {
                ok: false,
                status: 500,
                message: "Internal server error",
                data: null,
            };
        }
    },

    async logout(userId) {
        try {
            // Validate input
            if (!userId) {
                return {
                    ok: false,
                    status: 401,
                    message: "Unauthorized",
                    data: null,
                };
            }

            // Remove refresh token from DB
            await clearRefreshToken(userId);

            return {
                ok: true,
                status: 200,
                message: "Logout success",
                data: null,
            };

        } catch (error) {
            console.error(`Logout Service Error (userId=${userId}):`, error.message);
            return {
                ok: false,
                status: 500,
                message: "Internal server error",
                data: null,
            };
        }
    },

    async refreshToken(refreshTokenCookie, userId) {
        try {
            let token = refreshTokenCookie;

            // 1. If no token from cookie, try get from DB
            if (!token) {
                if (!userId) return {
                    ok: false,
                    status: 401,
                    message: "No refresh token",
                    data: null
                };

                const user = await findUserById(userId);

                if (!user || !user.refresh_token) return {
                    ok: false,
                    status: 403,
                    message: "Invalid refresh token",
                    data: null
                };

                token = user.refresh_token;
            }

            // 2. Verify token
            let payload;
            try {
                payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
            } catch (err) {
                return {
                    ok: false,
                    status: 403,
                    message: "Invalid or expired refresh token",
                    data: null
                };
            }

            // 3. Find user
            const user = await findUserById(payload.id);

            if (!user) return {
                ok: false,
                status: 404,
                message: "User not found",
                data: null
            };

            // 4. Generate new tokens
            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            // 5. Update refresh token in DB
            await saveRefreshToken(user.id, refreshToken);

            return {
                ok: true,
                status: 200,
                message: "Token refreshed",
                data: {
                    accessToken,
                    refreshToken
                }
            };
        } catch (err) {
            console.error("Refresh Token Service Error:", err.message);
            return {
                ok: false,
                status: 500,
                message: "Internal server error",
                data: null
            };
        }
    }
};

// Helper functions
const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
}

const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );
}

const saveRefreshToken = async (userId, refreshToken) => {
    await prisma.user.update({
        where: { id: userId },
        data: { refresh_token: refreshToken }
    });
}

const clearRefreshToken = async (userId) => {
    await prisma.user.update({
        where: { id: userId },
        data: { refresh_token: null }
    });
}

const findUserById = async (userId) => {
    return await prisma.user.findUnique({
        where: { id: userId }
    });
}