import ExcelJS from 'exceljs';

import { payrollRepository } from './payroll.repository.js';

const STANDARD_MONTHLY_HOURS = 160;
const EMPTY_TOTALS = {
  totalHours: 0,
  lateMinutes: 0,
  absentCount: 0,
  lateCount: 0,
};

export const payrollService = {
  async getLatestActiveContract(employeeId) {
    return payrollRepository.findLatestActiveContract(employeeId);
  },

  async getMonthlyTotals(employeeId, year, month) {
    const start = new Date(year, month - 1, 1, 12, 0, 0, 0);
    const end = new Date(year, month, 0, 12, 0, 0, 0);
    const attendances = await payrollRepository.findAttendancesByEmployeeAndRange(employeeId, start, end);

    const totalHours = attendances.reduce((sum, attendance) => sum + parseFloat(attendance.work_hours || 0), 0);
    const lateMinutes = attendances.reduce((sum, attendance) => sum + (attendance.late_minutes || 0), 0);
    const absentCount = attendances.filter((attendance) => attendance.status === 'absent').length;
    const lateCount = attendances.filter((attendance) => attendance.status === 'late').length;

    return { totalHours, lateMinutes, absentCount, lateCount };
  },

  async getPayslip(employeeId, year, month) {
    const employee = await payrollRepository.findActiveEmployeeById(employeeId);
    if (!employee) return null;

    const contract = await this.getLatestActiveContract(employeeId);
    const salary = contract?.salary ? parseFloat(contract.salary) : 0;
    const totals = await this.getMonthlyTotals(employeeId, year, month);
    const hourlyRate = salary > 0 ? salary / STANDARD_MONTHLY_HOURS : 0;
    const gross = +(hourlyRate * totals.totalHours).toFixed(2);
    const deductions = 0;
    const net = +(gross - deductions).toFixed(2);

    return {
      employee: {
        id: employee.id,
        full_name: employee.full_name,
        email: employee.email,
        department: employee.department ? { id: employee.department.id, name: employee.department.name } : null,
        position: employee.position ? { id: employee.position.id, name: employee.position.name } : null,
      },
      period: { year, month },
      contract: contract ? { id: contract.id, code: contract.code, salary } : null,
      totals,
      hourlyRate: +hourlyRate.toFixed(2),
      gross,
      deductions,
      net,
    };
  },

  _buildPayrollRow(employee, contract, totals, year, month) {
    const salary = contract?.salary ? parseFloat(contract.salary) : 0;
    const hourlyRate = salary > 0 ? salary / STANDARD_MONTHLY_HOURS : 0;
    const gross = +(hourlyRate * totals.totalHours).toFixed(2);
    const deductions = 0;
    const net = +(gross - deductions).toFixed(2);

    return {
      employee: {
        id: employee.id,
        full_name: employee.full_name,
        email: employee.email,
        department: employee.department ? { id: employee.department.id, name: employee.department.name } : null,
        position: employee.position ? { id: employee.position.id, name: employee.position.name } : null,
      },
      period: { year, month },
      contract: contract ? { id: contract.id, code: contract.code, salary } : null,
      totals,
      hourlyRate: +hourlyRate.toFixed(2),
      gross,
      deductions,
      net,
    };
  },

  async _buildMonthlyPayrollRows({ employees, year, month }) {
    if (employees.length === 0) return [];

    const employeeIds = employees.map((employee) => employee.id);
    const start = new Date(year, month - 1, 1, 12, 0, 0, 0);
    const end = new Date(year, month, 0, 12, 0, 0, 0);

    const [contracts, attendances] = await Promise.all([
      payrollRepository.findActiveContractsByEmployeeIds(employeeIds),
      payrollRepository.findAttendancesByEmployeeIdsAndRange(employeeIds, start, end),
    ]);

    const contractByEmployee = new Map();
    contracts.forEach((contract) => {
      if (!contractByEmployee.has(contract.employee_id)) {
        contractByEmployee.set(contract.employee_id, contract);
      }
    });

    const totalsByEmployee = new Map();
    attendances.forEach((attendance) => {
      const current = totalsByEmployee.get(attendance.employee_id) || { ...EMPTY_TOTALS };
      current.totalHours += parseFloat(attendance.work_hours || 0);
      current.lateMinutes += attendance.late_minutes || 0;
      if (attendance.status === 'absent') current.absentCount += 1;
      if (attendance.status === 'late') current.lateCount += 1;
      totalsByEmployee.set(attendance.employee_id, current);
    });

    return employees.map((employee) =>
      this._buildPayrollRow(
        employee,
        contractByEmployee.get(employee.id) || null,
        totalsByEmployee.get(employee.id) || { ...EMPTY_TOTALS },
        year,
        month,
      ),
    );
  },

  async getMonthlyPayroll(year, month, options = {}) {
    const {
      departmentId = null,
      search = '',
      page = 1,
      limit = 50,
      paginate = true,
    } = options;

    const employeeWhere = { is_deleted: false };
    if (departmentId && !Number.isNaN(departmentId)) {
      employeeWhere.department_id = parseInt(departmentId);
    }
    if (search && String(search).trim()) {
      const searchValue = String(search).trim();
      employeeWhere.OR = [
        { full_name: { contains: searchValue, mode: 'insensitive' } },
        { email: { contains: searchValue, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [employees, total] = await Promise.all([
      payrollRepository.findActiveEmployees(
        paginate ? { where: employeeWhere, skip, take: limit } : { where: employeeWhere },
      ),
      paginate ? payrollRepository.countActiveEmployees(employeeWhere) : Promise.resolve(null),
    ]);

    const rows = await this._buildMonthlyPayrollRows({ employees, year, month });
    if (!paginate) return rows;

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total: total ?? rows.length,
        total_pages: Math.max(Math.ceil((total ?? rows.length) / limit), 1),
      },
    };
  },

  async exportMonthlyPayroll(year, month, departmentId = null, search = '') {
    const rows = await this.getMonthlyPayroll(year, month, {
      departmentId,
      search,
      paginate: false,
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(`Payroll_${year}_${String(month).padStart(2, '0')}`);

    sheet.columns = [
      { header: 'Employee', key: 'employee', width: 28 },
      { header: 'Email', key: 'email', width: 26 },
      { header: 'Department', key: 'department', width: 18 },
      { header: 'Total Hours', key: 'hours', width: 14 },
      { header: 'Base Salary', key: 'salary', width: 14 },
      { header: 'Hourly Rate', key: 'rate', width: 12 },
      { header: 'Gross Pay', key: 'gross', width: 12 },
      { header: 'Late Minutes', key: 'lateMinutes', width: 12 },
      { header: 'Late Count', key: 'lateCount', width: 10 },
      { header: 'Absent Count', key: 'absentCount', width: 12 },
      { header: 'Net Pay', key: 'net', width: 12 },
    ];

    rows.forEach((row) => {
      sheet.addRow({
        employee: row.employee.full_name,
        email: row.employee.email,
        department: row.employee.department?.name || '',
        hours: row.totals.totalHours,
        salary: row.contract?.salary ?? 0,
        rate: row.hourlyRate,
        gross: row.gross,
        lateMinutes: row.totals.lateMinutes,
        lateCount: row.totals.lateCount,
        absentCount: row.totals.absentCount,
        net: row.net,
      });
    });

    sheet.getRow(1).font = { bold: true };
    return workbook.xlsx.writeBuffer();
  },
};

export default payrollService;
