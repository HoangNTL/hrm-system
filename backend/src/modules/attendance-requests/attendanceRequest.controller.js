import response from '../../shared/utils/response.js';

import { attendanceRequestService } from './attendanceRequest.service.js';

export const attendanceRequestController = {
  async createRequest(req, res, next) {
    try {
      const request = await attendanceRequestService.create(
        req.validated?.createBody || req.body,
        req.user,
      );
      response.success(res, request, 'Tạo đơn xin sửa chấm công thành công');
    } catch (error) {
      next(error);
    }
  },

  async getMyRequests(req, res, next) {
    try {
      const result = await attendanceRequestService.getMine(
        req.validated?.listQuery || req.query,
        req.user,
      );
      response.success(res, result, 'Lấy danh sách đơn thành công');
    } catch (error) {
      next(error);
    }
  },

  async getAllRequests(req, res, next) {
    try {
      const result = await attendanceRequestService.getAll(req.validated?.listQuery || req.query);
      response.success(res, result, 'Lấy tất cả đơn thành công');
    } catch (error) {
      next(error);
    }
  },

  async approveRequest(req, res, next) {
    try {
      const approvedRequest = await attendanceRequestService.approve(
        req.validated?.requestId,
        req.validated?.reviewBody?.notes,
        req.user.id,
      );
      response.success(res, approvedRequest, 'Duyệt đơn thành công');
    } catch (error) {
      next(error);
    }
  },

  async rejectRequest(req, res, next) {
    try {
      const rejectedRequest = await attendanceRequestService.reject(
        req.validated?.requestId,
        req.validated?.reviewBody?.notes,
        req.user.id,
      );
      response.success(res, rejectedRequest, 'Từ chối đơn thành công');
    } catch (error) {
      next(error);
    }
  },

  async getRequest(req, res, next) {
    try {
      const request = await attendanceRequestService.getById(req.validated?.requestId, req.user);
      response.success(res, request, 'Lấy chi tiết đơn thành công');
    } catch (error) {
      next(error);
    }
  },
};

export const {
  approveRequest,
  createRequest,
  getAllRequests,
  getMyRequests,
  getRequest,
  rejectRequest,
} = attendanceRequestController;
