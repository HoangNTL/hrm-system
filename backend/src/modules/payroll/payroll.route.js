import express from 'express';

import { payrollController } from './payroll.controller.js';
import { payrollPolicy } from './payroll.policy.js';
import { payrollValidator } from './payroll.validator.js';

const router = express.Router();

router.get('/monthly', ...payrollPolicy.requireHrOrAdmin, payrollValidator.validateMonthlyQuery, payrollController.getMonthly);
router.get('/export', ...payrollPolicy.requireHrOrAdmin, payrollValidator.validateExportQuery, payrollController.exportMonthly);
router.get('/payslip', ...payrollPolicy.requireUser, payrollValidator.validatePayslipQuery, payrollController.getPayslip);

export default router;
