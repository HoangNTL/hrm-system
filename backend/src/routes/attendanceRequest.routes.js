import express from 'express';
import {
	createRequest,
	getMyRequests,
	getAllRequests,
	approveRequest,
	rejectRequest,
	getRequest,
} from '../controllers/attendanceRequest.controller.js';
import { verifyToken, verifyRole } from '../middlewares/auth.js';
import { HR_ADMIN_ROLES } from '../utils/roles.js';

const router = express.Router();

// Middleware: kiểm tra auth
router.use(verifyToken);

// Nhân viên: tạo đơn xin sửa chấm công
router.post('/create', createRequest);

// Nhân viên: xem danh sách đơn của mình
router.get('/my-requests', getMyRequests);

// Nhân viên/HR: xem chi tiết một đơn
router.get('/:id', getRequest);

// HR/Admin: xem tất cả đơn (phân trang, lọc)
router.get('/', verifyRole(HR_ADMIN_ROLES), getAllRequests);

// HR/Admin: duyệt đơn
router.put('/:id/approve', verifyRole(HR_ADMIN_ROLES), approveRequest);

// HR/Admin: từ chối đơn
router.put('/:id/reject', verifyRole(HR_ADMIN_ROLES), rejectRequest);

export default router;
