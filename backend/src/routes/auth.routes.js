import express from 'express';

import { login, logout, refreshToken, changePassword } from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

// Auth routes
router.post('/login', login);
router.post('/logout', verifyToken, logout);
router.post('/refresh-token', refreshToken);
router.post('/change-password', verifyToken, changePassword);

export default router;
