import axiosClient from '@/shared/api/axiosClient';

export const attendanceAPI = {
  getShifts() {
    return axiosClient.get('/attendance/shifts');
  },

  checkIn(data) {
    return axiosClient.post('/attendance/check-in', data);
  },

  checkOut(data) {
    return axiosClient.post('/attendance/check-out', data);
  },

  getTodayStatus(params = {}) {
    return axiosClient.get('/attendance/today', { params });
  },

  getHistory(params = {}) {
    return axiosClient.get('/attendance/history', { params });
  },

  getMonthly(params = {}) {
    return axiosClient.get('/attendance/monthly', { params });
  },

  getAll(params = {}) {
    return axiosClient.get('/attendance', { params });
  },

  update(id, data) {
    return axiosClient.put(`/attendance/${id}`, data);
  },

  remove(id) {
    return axiosClient.delete(`/attendance/${id}`);
  },
};

export default attendanceAPI;
