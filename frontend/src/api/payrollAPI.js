import apiClient from './axios';

export const payrollAPI = {
  async getMonthly(yearOrOptions, month, departmentId) {
    const isOptionsObject =
      typeof yearOrOptions === 'object' && yearOrOptions !== null;

    const params = isOptionsObject
      ? { ...yearOrOptions }
      : { year: yearOrOptions, month };

    if (!isOptionsObject && departmentId) {
      params.departmentId = departmentId;
    }

    const res = await apiClient.get('/payroll/monthly', { params });
    return res.data;
  },

  async getPayslip(year, month, employeeId) {
    const params = { year, month };
    if (employeeId) params.employeeId = employeeId; // optional for Admin/HR viewing specific employee
    const res = await apiClient.get('/payroll/payslip', { params });
    return res.data;
  },

  async exportMonthly(year, month, departmentId, search = '') {
    const params = { year, month };
    if (departmentId) params.departmentId = departmentId;
    if (search) params.search = search;
    const res = await apiClient.get('/payroll/export', {
      params,
      responseType: 'blob',
    });
    return res.data; // blob
  },
};
