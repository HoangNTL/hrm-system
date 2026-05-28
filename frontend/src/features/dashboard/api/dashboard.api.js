import axiosClient from '@/shared/api/axiosClient';
import { normalizeSingleResponse } from '@/shared/api/apiResponse';

export const dashboardAPI = {
  getEmployees(params = {}) {
    return axiosClient.get('/employees', { params }).then(normalizeSingleResponse);
  },

  getDepartments(params = {}) {
    return axiosClient.get('/departments', { params }).then(normalizeSingleResponse);
  },

  getPendingAttendanceRequests(params = {}) {
    return axiosClient.get('/attendance-requests', { params }).then(normalizeSingleResponse);
  },

  getAttendance(params = {}) {
    return axiosClient.get('/attendance', { params }).then(normalizeSingleResponse);
  },

  getProfile() {
    return axiosClient.get('/users/me').then(normalizeSingleResponse);
  },

  getAttendanceHistory(params = {}) {
    return axiosClient.get('/attendance/history', { params }).then(normalizeSingleResponse);
  },

  getPayslip(params = {}) {
    return axiosClient.get('/payroll/payslip', { params }).then(normalizeSingleResponse);
  },

  getMyAttendanceRequests(params = {}) {
    return axiosClient
      .get('/attendance-requests/my-requests', { params })
      .then(normalizeSingleResponse);
  },
};

export default dashboardAPI;
