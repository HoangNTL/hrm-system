import express from 'express';

import { attendanceRequestController } from './attendanceRequest.controller.js';
import { attendanceRequestPolicy } from './attendanceRequest.policy.js';
import { attendanceRequestValidator } from './attendanceRequest.validator.js';

const router = express.Router();

router.use(...attendanceRequestPolicy.requireAuthenticated);

router.post(
  '/create',
  attendanceRequestValidator.validateCreate,
  attendanceRequestController.createRequest,
);
router.get(
  '/my-requests',
  attendanceRequestValidator.validateListQuery,
  attendanceRequestController.getMyRequests,
);
router.get(
  '/:id',
  attendanceRequestValidator.validateIdParam,
  attendanceRequestController.getRequest,
);

router.get(
  '/',
  ...attendanceRequestPolicy.requireHrOrAdminRole,
  attendanceRequestValidator.validateListQuery,
  attendanceRequestController.getAllRequests,
);
router.put(
  '/:id/approve',
  ...attendanceRequestPolicy.requireHrOrAdminRole,
  attendanceRequestValidator.validateIdParam,
  attendanceRequestValidator.validateReviewBody,
  attendanceRequestController.approveRequest,
);
router.put(
  '/:id/reject',
  ...attendanceRequestPolicy.requireHrOrAdminRole,
  attendanceRequestValidator.validateIdParam,
  attendanceRequestValidator.validateReviewBody,
  attendanceRequestController.rejectRequest,
);

export default router;
