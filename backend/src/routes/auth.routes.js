import express from 'express';

import { login, logout, refreshToken } from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/logout
router.post('/logout', verifyToken, logout);

// POST /api/auth/refresh-token
router.post('/refresh-token', verifyToken, refreshToken);

export default router;

