import axios from './axios';

export const attendanceRequestAPI = {
  // Nhân viên: tạo đơn xin sửa chấm công
  createRequest: (data) => axios.post('/attendance-requests/create', data),

  // Nhân viên: xem danh sách đơn của mình
  getMyRequests: (params) => axios.get('/attendance-requests/my-requests', { params }),

  // Xem chi tiết một đơn
  getRequest: (id) => axios.get(`/attendance-requests/${id}`),

  // HR/Admin: xem tất cả đơn
  getAllRequests: (params) => axios.get('/attendance-requests', { params }),

  // HR/Admin: duyệt đơn
  approveRequest: (id, data) => axios.put(`/attendance-requests/${id}/approve`, data),

  // HR/Admin: từ chối đơn
  rejectRequest: (id, data) => axios.put(`/attendance-requests/${id}/reject`, data),
};
