import { prisma } from '../config/db.js';
import * as userService from '../services/user.service.js';

export const getAllUsers = async (_req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Create login account for an existing employee
export const createAccountForEmployee = async (req, res) => {
    const employeeId = Number(req.params.employeeId);

    if (!employeeId) {
        return res.status(400).json({ error: 'Invalid employee id' });
    }

    try {
        const employee = await prisma.employee.findUnique({
            where: { id: employeeId },
            include: { user_account: true },
        });

        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        if (employee.user_account) {
            return res.status(409).json({ error: 'Employee already has an account' });
        }

        if (!employee.email) {
            return res.status(400).json({ error: 'Employee does not have an email' });
        }

        const accountInfo = await userService.createUserAccount({
            email: employee.email,
            employee_id: employee.id,
            role: 'STAFF',
        });

        return res.status(201).json({
            message: 'Account created successfully',
            data: accountInfo,
        });
    } catch (error) {
        console.error('Error creating account for employee:', error);
        return res.status(500).json({ error: 'Failed to create account' });
    }
};

// Reset password for an existing user
export const resetPassword = async (req, res) => {
    const userId = Number(req.params.userId);

    if (!userId) {
        return res.status(400).json({ error: 'Invalid user id' });
    }

    try {
        const accountInfo = await userService.resetUserPassword(userId);
        return res.status(200).json({
            message: 'Password reset successfully',
            data: accountInfo,
        });
    } catch (error) {
        console.error('Error resetting password:', error);
        return res.status(500).json({ error: 'Failed to reset password' });
    }
};
