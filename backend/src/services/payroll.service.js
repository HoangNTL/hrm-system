import { prisma } from '../config/db.js';
import ExcelJS from 'exceljs';

const STANDARD_MONTHLY_HOURS = 160; // simple baseline for hourly rate

const EMPTY_TOTALS = {
  totalHours: 0,
  lateMinutes: 0,
  absentCount: 0,
  lateCount: 0,
};

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
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, is_deleted: false },
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
        department: employee.department ? {
          id: employee.department.id,
          name: employee.department.name,
        } : null,
        position: employee.position ? {
          id: employee.position.id,
          name: employee.position.name,
        } : null,
      },
      period: { year, month },
      contract: contract ? {
        id: contract.id,
        code: contract.code,
        salary,
      } : null,
      totals,
      hourlyRate: +hourlyRate.toFixed(2),
      gross,
      deductions,
      net,
    };
  },

  async _buildMonthlyPayrollRows({ employees, year, month }) {
    if (employees.length === 0) {
      return [];
    }

    const employeeIds = employees.map((employee) => employee.id);
    const start = new Date(year, month - 1, 1, 12, 0, 0, 0);
    const end = new Date(year, month, 0, 12, 0, 0, 0);

    const [contracts, attendances] = await Promise.all([
      prisma.contract.findMany({
        where: {
          employee_id: { in: employeeIds },
          is_deleted: false,
          status: 'active',
        },
        select: {
          id: true,
          code: true,
          salary: true,
          employee_id: true,
          start_date: true,
        },
        orderBy: [{ employee_id: 'asc' }, { start_date: 'desc' }],
      }),
      prisma.attendance.findMany({
        where: {
          employee_id: { in: employeeIds },
          date: { gte: start, lte: end },
          is_deleted: false,
        },
        select: {
          employee_id: true,
          work_hours: true,
          late_minutes: true,
          status: true,
        },
      }),
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
    if (departmentId && !isNaN(departmentId)) {
      employeeWhere.department_id = parseInt(departmentId);
      console.log('Filtering by department_id:', parseInt(departmentId));
    } else {
      console.log('No department filter applied');
    }

    if (search && String(search).trim()) {
      const searchValue = String(search).trim();
      employeeWhere.OR = [
        { full_name: { contains: searchValue, mode: 'insensitive' } },
        { email: { contains: searchValue, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const employeeQuery = {
      where: employeeWhere,
      include: { department: true, position: true },
      orderBy: { id: 'desc' },
    };

    const [employees, total] = await Promise.all([
      prisma.employee.findMany(
        paginate
          ? {
              ...employeeQuery,
              skip,
              take: limit,
            }
          : employeeQuery,
      ),
      paginate ? prisma.employee.count({ where: employeeWhere }) : Promise.resolve(null),
    ]);

    console.log(`Found ${employees.length} employees for payroll`);

    const rows = await this._buildMonthlyPayrollRows({ employees, year, month });

    if (!paginate) {
      return rows;
    }

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
