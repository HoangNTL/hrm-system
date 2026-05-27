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
import { HR_ADMIN_ROLES, UserRole } from '../utils/roles.js';

const router = express.Router();

// Get shifts (all roles)
router.get('/shifts', verifyToken, getShifts);

// STAFF ONLY - check-in/check-out
router.post('/check-in', verifyToken, verifyRole([UserRole.STAFF]), checkIn);
router.post('/check-out', verifyToken, verifyRole([UserRole.STAFF]), checkOut);
router.get('/today', verifyToken, verifyRole([UserRole.STAFF]), getTodayStatus);
router.get('/history', verifyToken, verifyRole([UserRole.STAFF]), getHistory);
router.get('/monthly', verifyToken, verifyRole([UserRole.STAFF]), getMonthlyHours);

// HR/Admin ONLY - view all records
router.get('/', verifyToken, verifyRole(HR_ADMIN_ROLES), getAll);
router.put('/:id', verifyToken, verifyRole(HR_ADMIN_ROLES), update);
router.delete('/:id', verifyToken, verifyRole(HR_ADMIN_ROLES), remove);

export default router;
