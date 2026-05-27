import express from 'express';
import { getMonthly, exportMonthly, getPayslip } from '../controllers/payroll.controller.js';
import { verifyToken, verifyRole } from '../middlewares/auth.js';
import { HR_ADMIN_ROLES, USER_ROLES } from '../utils/roles.js';

const router = express.Router();

// HR/Admin - monthly payroll and export
router.get('/monthly', verifyToken, verifyRole(HR_ADMIN_ROLES), getMonthly);
router.get('/export', verifyToken, verifyRole(HR_ADMIN_ROLES), exportMonthly);

// Staff - personal payslip
router.get('/payslip', verifyToken, verifyRole(USER_ROLES), getPayslip);

export default router;
