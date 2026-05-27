import express from 'express';

import {
  getUsers,
  createUser,
  resetPassword,
  toggleLock,
  getUserStats,
  bulkDeleteUsers,
  getCurrentUser,
  updateCurrentUser,
} from '../controllers/user.controller.js';
import { verifyToken, verifyRole } from '../middlewares/auth.js';
import { UserRole } from '../utils/roles.js';

const router = express.Router();

router.get('/me', verifyToken, getCurrentUser);
router.put('/me', verifyToken, updateCurrentUser);
router.get('/', verifyToken, verifyRole([UserRole.ADMIN]), getUsers);
router.post('/', verifyToken, verifyRole([UserRole.ADMIN]), createUser);
router.get('/stats', verifyToken, verifyRole([UserRole.ADMIN]), getUserStats);
router.post('/bulk-delete', verifyToken, verifyRole([UserRole.ADMIN]), bulkDeleteUsers);
router.post('/:id/reset-password', verifyToken, verifyRole([UserRole.ADMIN]), resetPassword);
router.patch('/:id/toggle-lock', verifyToken, verifyRole([UserRole.ADMIN]), toggleLock);

export default router;
