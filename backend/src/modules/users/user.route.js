import express from 'express';

import { userController } from './user.controller.js';
import { userPolicy } from './user.policy.js';
import { userValidator } from './user.validator.js';

const router = express.Router();

router.get('/me', userPolicy.requireAuthenticated, userController.getCurrentUser);
router.put(
  '/me',
  userPolicy.requireAuthenticated,
  userValidator.validateCurrentProfileUpdate,
  userController.updateCurrentUser,
);
router.get(
  '/',
  userPolicy.requireAdmin,
  userValidator.validateListQuery,
  userController.getUsers,
);
router.post(
  '/',
  userPolicy.requireAdmin,
  userValidator.validateCreate,
  userController.createUser,
);
router.get('/stats', userPolicy.requireAdmin, userController.getUserStats);
router.post(
  '/bulk-delete',
  userPolicy.requireAdmin,
  userValidator.validateBulkDelete,
  userController.bulkDeleteUsers,
);
router.post(
  '/:id/reset-password',
  userPolicy.requireAdmin,
  userValidator.validateUserIdParam,
  userController.resetPassword,
);
router.patch(
  '/:id/toggle-lock',
  userPolicy.requireAdmin,
  userValidator.validateUserIdParam,
  userController.toggleLock,
);

export default router;
