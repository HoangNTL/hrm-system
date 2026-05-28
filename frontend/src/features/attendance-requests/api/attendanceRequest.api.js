import axiosClient from '@/shared/api/axiosClient';

export const attendanceRequestAPI = {
  createRequest(data) {
    return axiosClient.post('/attendance-requests/create', data);
  },

  getMyRequests(params) {
    return axiosClient.get('/attendance-requests/my-requests', { params });
  },

  getRequest(id) {
    return axiosClient.get(`/attendance-requests/${id}`);
  },

  getAllRequests(params) {
    return axiosClient.get('/attendance-requests', { params });
  },

  approveRequest(id, data) {
    return axiosClient.put(`/attendance-requests/${id}/approve`, data);
  },

  rejectRequest(id, data) {
    return axiosClient.put(`/attendance-requests/${id}/reject`, data);
  },
};

export default attendanceRequestAPI;
