import axiosClient from '@/shared/api/axiosClient';
import { normalizeSingleResponse } from '@/shared/api/apiResponse';

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

    const res = await axiosClient.get('/payroll/monthly', { params });
    return normalizeSingleResponse(res);
  },

  async getPayslip(year, month, employeeId) {
    const params = { year, month };
    if (employeeId) params.employeeId = employeeId;
    const res = await axiosClient.get('/payroll/payslip', { params });
    return normalizeSingleResponse(res);
  },

  async exportMonthly(year, month, departmentId, search = '') {
    const params = { year, month };
    if (departmentId) params.departmentId = departmentId;
    if (search) params.search = search;
    const res = await axiosClient.get('/payroll/export', {
      params,
      responseType: 'blob',
    });
    return res.data;
  },
};

export default payrollAPI;
