import express from 'express';
import attendanceController from '../controllers/attendance.controller.js';
import { verifyToken, verifyRole } from '../middlewares/auth.js';

const router = express.Router();

// Get shifts (all roles)
router.get('/shifts', verifyToken, attendanceController.getShifts);

// STAFF ONLY - check-in/check-out
router.post('/check-in', verifyToken, verifyRole(['STAFF']), attendanceController.checkIn);
router.post('/check-out', verifyToken, verifyRole(['STAFF']), attendanceController.checkOut);
router.get('/today', verifyToken, verifyRole(['STAFF']), attendanceController.getTodayStatus);
router.get('/history', verifyToken, verifyRole(['STAFF']), attendanceController.getHistory);
router.get('/monthly', verifyToken, verifyRole(['STAFF']), attendanceController.getMonthlyHours);

// HR/Admin ONLY - view all records
router.get('/', verifyToken, verifyRole(['ADMIN', 'HR']), attendanceController.getAll);
router.put('/:id', verifyToken, verifyRole(['ADMIN', 'HR']), attendanceController.update);
router.delete('/:id', verifyToken, verifyRole(['ADMIN', 'HR']), attendanceController.delete);

export default router;
