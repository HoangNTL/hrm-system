import express from 'express';
import { getMonthly, exportMonthly, getPayslip } from '../controllers/payroll.controller.js';
import { verifyToken, verifyRole } from '../middlewares/auth.js';

const router = express.Router();

// HR/Admin - monthly payroll and export
router.get('/monthly', verifyToken, verifyRole(['ADMIN', 'HR']), getMonthly);
router.get('/export', verifyToken, verifyRole(['ADMIN', 'HR']), exportMonthly);

// Staff - personal payslip
router.get('/payslip', verifyToken, verifyRole(['STAFF', 'ADMIN', 'HR']), getPayslip);

export default router;
