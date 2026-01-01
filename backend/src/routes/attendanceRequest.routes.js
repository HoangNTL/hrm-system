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
router.get('/', verifyRole(['ADMIN', 'HR']), getAllRequests);

// HR/Admin: duyệt đơn
router.put('/:id/approve', verifyRole(['ADMIN', 'HR']), approveRequest);

// HR/Admin: từ chối đơn
router.put('/:id/reject', verifyRole(['ADMIN', 'HR']), rejectRequest);

export default router;
