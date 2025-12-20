import express from 'express';

import {
  getUsers,
  createUser,
  resetPassword,
  toggleLock,
  getUserStats,
  bulkDeleteUsers,
} from '../controllers/user.controller.js';

const router = express.Router();

router.get('/', getUsers);
router.post('/', createUser);
router.get('/stats', getUserStats);
router.post('/bulk-delete', bulkDeleteUsers);
router.post('/:id/reset-password', resetPassword);
router.patch('/:id/toggle-lock', toggleLock);

export default router;
