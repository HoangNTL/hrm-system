import express from 'express';

import { login, logout, refreshToken } from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

// Auth routes
router.post('/login', login);
router.post('/logout', verifyToken, logout);
router.post('/refresh-token', refreshToken);

export default router;
