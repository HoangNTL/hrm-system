import express from 'express';
import payrollController from '../controllers/payroll.controller.js';
import { verifyToken, verifyRole } from '../middlewares/auth.js';

const router = express.Router();

// HR/Admin - monthly payroll and export
router.get('/monthly', verifyToken, verifyRole(['ADMIN', 'HR']), (req, res) => payrollController.getMonthly(req, res));
router.get('/export', verifyToken, verifyRole(['ADMIN', 'HR']), (req, res) => payrollController.exportMonthly(req, res));

// Staff - personal payslip
router.get('/payslip', verifyToken, verifyRole(['STAFF', 'ADMIN', 'HR']), (req, res) => payrollController.getPayslip(req, res));

export default router;
