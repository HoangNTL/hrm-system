import payrollService from '../services/payroll.service.js';
import logger from '../utils/logger.js';

class PayrollController {
  async getMonthly(req, res) {
    try {
      const year = parseInt(req.query.year) || new Date().getFullYear();
      const month = parseInt(req.query.month) || new Date().getMonth() + 1;
      const deptIdRaw = req.query.departmentId;
      const departmentId = (deptIdRaw && deptIdRaw !== '' && !isNaN(parseInt(deptIdRaw))) ? parseInt(deptIdRaw) : null;

      console.log('Payroll request:', { year, month, departmentId, deptIdRaw });
      const data = await payrollService.getMonthlyPayroll(year, month, departmentId);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      logger.error('Get monthly payroll error:', error);
      return res.status(500).json({ success: false, message: error.message || 'Payroll error' });
    }
  }

  async getPayslip(req, res) {
    try {
      const employeeId = req.user.role === 'STAFF' ? req.user.employee_id : parseInt(req.query.employeeId);
      if (!employeeId) return res.status(400).json({ success: false, message: 'employeeId required' });
      const year = parseInt(req.query.year) || new Date().getFullYear();
      const month = parseInt(req.query.month) || new Date().getMonth() + 1;

      const data = await payrollService.getPayslip(employeeId, year, month);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      logger.error('Get payslip error:', error);
      return res.status(500).json({ success: false, message: error.message || 'Payslip error' });
    }
  }

  async exportMonthly(req, res) {
    try {
      const year = parseInt(req.query.year) || new Date().getFullYear();
      const month = parseInt(req.query.month) || new Date().getMonth() + 1;
      const deptIdRaw = req.query.departmentId;
      const departmentId = (deptIdRaw && deptIdRaw !== '' && !isNaN(parseInt(deptIdRaw))) ? parseInt(deptIdRaw) : null;

      const buffer = await payrollService.exportMonthlyPayroll(year, month, departmentId);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=Payroll_${year}_${String(month).padStart(2, '0')}.xlsx`);
      return res.status(200).send(buffer);
    } catch (error) {
      logger.error('Export payroll error:', error);
      return res.status(500).json({ success: false, message: error.message || 'Export error' });
    }
  }
}

export default new PayrollController();
