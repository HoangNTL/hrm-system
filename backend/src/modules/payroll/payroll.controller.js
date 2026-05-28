import logger from '../../shared/utils/logger.js';
import { ErrorMessages } from '../../utils/errorMessages.js';
import { UserRole } from '../../shared/constants/roles.js';
import payrollService from './payroll.service.js';

export const payrollController = {
  async getMonthly(req, res) {
    try {
      const { year, month, departmentId, page, limit, search } = req.validated.monthlyQuery;
      const result = await payrollService.getMonthlyPayroll(year, month, {
        departmentId,
        search,
        page,
        limit,
      });

      return res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      logger.error('Get monthly payroll error:', error);
      return res.status(500).json({ success: false, message: ErrorMessages.PAYROLL.FETCH_FAILED });
    }
  },

  async getPayslip(req, res) {
    try {
      const { year, month, employeeId: queryEmployeeId } = req.validated.payslipQuery;
      const employeeId =
        req.user.role === UserRole.STAFF ? req.user.employee_id : queryEmployeeId;

      if (!employeeId) {
        return res.status(400).json({ success: false, message: 'employeeId required' });
      }

      const data = await payrollService.getPayslip(employeeId, year, month);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      logger.error('Get payslip error:', error);
      return res.status(500).json({ success: false, message: ErrorMessages.PAYROLL.PAYSLIP_FAILED });
    }
  },

  async exportMonthly(req, res) {
    try {
      const { year, month, departmentId, search } = req.validated.exportQuery;
      const buffer = await payrollService.exportMonthlyPayroll(year, month, departmentId, search);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=Payroll_${year}_${String(month).padStart(2, '0')}.xlsx`,
      );
      return res.status(200).send(buffer);
    } catch (error) {
      logger.error('Export payroll error:', error);
      return res.status(500).json({ success: false, message: ErrorMessages.PAYROLL.EXPORT_FAILED });
    }
  },
};

export const { exportMonthly, getMonthly, getPayslip } = payrollController;
