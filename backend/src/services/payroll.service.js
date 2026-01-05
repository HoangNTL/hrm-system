import { prisma } from '../config/db.js';
import ExcelJS from 'exceljs';

const STANDARD_MONTHLY_HOURS = 160; // simple baseline for hourly rate

// Convert class-based service to function/object-based for consistency
const payrollService = {
  async getLatestActiveContract(employeeId) {
    const contract = await prisma.contract.findFirst({
      where: {
        employee_id: employeeId,
        is_deleted: false,
        status: 'active',
      },
      orderBy: { start_date: 'desc' },
    });
    return contract;
  },

  async getMonthlyTotals(employeeId, year, month) {
    const start = new Date(year, month - 1, 1, 12, 0, 0, 0);
    const end = new Date(year, month, 0, 12, 0, 0, 0);

    const attendances = await prisma.attendance.findMany({
      where: {
        employee_id: employeeId,
        date: { gte: start, lte: end },
        is_deleted: false,
      },
    });

    const totalHours = attendances.reduce(
      (sum, a) => sum + parseFloat(a.work_hours || 0),
      0
    );
    const lateMinutes = attendances.reduce((sum, a) => sum + (a.late_minutes || 0), 0);
    const absentCount = attendances.filter((a) => a.status === 'absent').length;
    const lateCount = attendances.filter((a) => a.status === 'late').length;

    return { totalHours, lateMinutes, absentCount, lateCount };
  },

  async getPayslip(employeeId, year, month) {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { department: true, position: true },
    });
    if (!employee) return null;

    const contract = await this.getLatestActiveContract(employeeId);
    const salary = contract?.salary ? parseFloat(contract.salary) : 0;

    const totals = await this.getMonthlyTotals(employeeId, year, month);
    const hourlyRate = salary > 0 ? salary / STANDARD_MONTHLY_HOURS : 0;
    const gross = +(hourlyRate * totals.totalHours).toFixed(2);
    const deductions = 0; // placeholder for insurance/tax if needed later
    const net = +(gross - deductions).toFixed(2);

    return {
      employee: {
        id: employee.id,
        full_name: employee.full_name,
        email: employee.email,
        department: employee.department ? { 
          id: employee.department.id,
          name: employee.department.name 
        } : null,
        position: employee.position ? {
          id: employee.position.id,
          name: employee.position.name
        } : null,
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

  async getMonthlyPayroll(year, month, departmentId = null) {
    const employeeWhere = { is_deleted: false };
    if (departmentId && !isNaN(departmentId)) {
      employeeWhere.department_id = parseInt(departmentId);
      console.log('Filtering by department_id:', parseInt(departmentId));
    } else {
      console.log('No department filter applied');
    }

    const employees = await prisma.employee.findMany({
      where: employeeWhere,
      include: { department: true },
    });
    console.log(`Found ${employees.length} employees for payroll`);

    const rows = [];
    for (const emp of employees) {
      const payslip = await this.getPayslip(emp.id, year, month);
      rows.push(payslip);
    }

    return rows;
  },

  async exportMonthlyPayroll(year, month, departmentId = null) {
    const rows = await this.getMonthlyPayroll(year, month, departmentId);
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(
      `Payroll_${year}_${String(month).padStart(2, '0')}`
    );

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

    rows.forEach((r) => {
      sheet.addRow({
        employee: r.employee.full_name,
        email: r.employee.email,
        department: r.employee.department?.name || '',
        hours: r.totals.totalHours,
        salary: r.contract?.salary ?? 0,
        rate: r.hourlyRate,
        gross: r.gross,
        lateMinutes: r.totals.lateMinutes,
        lateCount: r.totals.lateCount,
        absentCount: r.totals.absentCount,
        net: r.net,
      });
    });

    sheet.getRow(1).font = { bold: true };
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  },
};

export default payrollService;
