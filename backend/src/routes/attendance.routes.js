import express from 'express';
import {
    getShifts,
    checkIn,
    checkOut,
    getTodayStatus,
    getHistory,
    getMonthlyHours,
    getAll,
    update,
    remove,
} from '../controllers/attendance.controller.js';
import { verifyToken, verifyRole } from '../middlewares/auth.js';

const router = express.Router();

// Get shifts (all roles)
router.get('/shifts', verifyToken, getShifts);

// STAFF ONLY - check-in/check-out
router.post('/check-in', verifyToken, verifyRole(['STAFF']), checkIn);
router.post('/check-out', verifyToken, verifyRole(['STAFF']), checkOut);
router.get('/today', verifyToken, verifyRole(['STAFF']), getTodayStatus);
router.get('/history', verifyToken, verifyRole(['STAFF']), getHistory);
router.get('/monthly', verifyToken, verifyRole(['STAFF']), getMonthlyHours);

// HR/Admin ONLY - view all records
router.get('/', verifyToken, verifyRole(['ADMIN', 'HR']), getAll);
router.put('/:id', verifyToken, verifyRole(['ADMIN', 'HR']), update);
router.delete('/:id', verifyToken, verifyRole(['ADMIN', 'HR']), remove);

export default router;
