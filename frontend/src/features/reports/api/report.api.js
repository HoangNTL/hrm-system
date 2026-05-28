import axiosClient from '@/shared/api/axiosClient';
import { normalizeSingleResponse } from '@/shared/api/apiResponse';

export const reportAPI = {
  getAttendance(params = {}) {
    return axiosClient.get('/attendance', { params }).then(normalizeSingleResponse);
  },

  getPayrollMonthly(params = {}) {
    return axiosClient.get('/payroll/monthly', { params }).then(normalizeSingleResponse);
  },

  getEmployees(params = {}) {
    return axiosClient.get('/employees', { params }).then(normalizeSingleResponse);
  },
};

export default reportAPI;
