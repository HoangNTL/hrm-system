import { prisma } from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


export const authService = {
    // Login service
    async login(email, password) {
        if (!email || !password) {
            return {
                ok: false,
                status: 400,
                message: "Email and password are required",
            };
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                employee: true,
            },
        });

        if (!user) {
            return {
                ok: false,
                status: 401,
                message: "Invalid email or password",
            };
        }

        // Validate password
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return {
                ok: false,
                status: 401,
                message: "Invalid email or password",
            };
        }

        // Generate Access Token
        const accessToken = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        // Generate Refresh Token
        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        // Optionally: save refresh token in DB
        // await prisma.user.update({
        //     where: { id: user.id },
        //     data: { refresh_token: refreshToken },
        // });

        return {
            ok: true,
            status: 200,
            message: "Login success",
            data: {
                accessToken,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    employee: user.employee,
                }
            }
        };
    },
};
