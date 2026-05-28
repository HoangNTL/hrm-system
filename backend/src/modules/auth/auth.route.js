import express from 'express';

import { verifyToken } from '../../shared/middlewares/auth.middleware.js';
import { authController } from './auth.controller.js';
import { authValidator } from './auth.validator.js';

const router = express.Router();

router.post('/login', authValidator.validateLogin, authController.login);
router.post('/logout', verifyToken, authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.post(
  '/change-password',
  verifyToken,
  authValidator.validateChangePassword,
  authController.changePassword,
);

export default router;
