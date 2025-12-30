import apiClient from './axios';

export const payrollAPI = {
  async getMonthly(year, month, departmentId) {
    const params = { year, month };
    if (departmentId) params.departmentId = departmentId;
    const res = await apiClient.get('/payroll/monthly', { params });
    return res.data;
  },

  async getPayslip(year, month, employeeId) {
    const params = { year, month };
    if (employeeId) params.employeeId = employeeId; // optional for Admin/HR viewing specific employee
    const res = await apiClient.get('/payroll/payslip', { params });
    return res.data;
  },

  async exportMonthly(year, month, departmentId) {
    const params = { year, month };
    if (departmentId) params.departmentId = departmentId;
    const res = await apiClient.get('/payroll/export', {
      params,
      responseType: 'blob',
    });
    return res.data; // blob
  },
};
