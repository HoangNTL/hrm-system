import express from 'express';

import { attendanceController } from './attendance.controller.js';
import { attendancePolicy } from './attendance.policy.js';
import { attendanceValidator } from './attendance.validator.js';

const router = express.Router();

router.get('/shifts', ...attendancePolicy.requireAuthenticated, attendanceController.getShifts);

router.post(
  '/check-in',
  ...attendancePolicy.requireStaff,
  attendanceValidator.validateCheckAction,
  attendanceController.checkIn,
);
router.post(
  '/check-out',
  ...attendancePolicy.requireStaff,
  attendanceValidator.validateCheckAction,
  attendanceController.checkOut,
);
router.get(
  '/today',
  ...attendancePolicy.requireStaff,
  attendanceValidator.validateTodayQuery,
  attendanceController.getTodayStatus,
);
router.get(
  '/history',
  ...attendancePolicy.requireStaff,
  attendanceValidator.validateHistoryQuery,
  attendanceController.getHistory,
);
router.get(
  '/monthly',
  ...attendancePolicy.requireStaff,
  attendanceValidator.validateMonthlyQuery,
  attendanceController.getMonthlyHours,
);

router.get(
  '/',
  ...attendancePolicy.requireHrOrAdmin,
  attendanceValidator.validateListQuery,
  attendanceController.getAll,
);
router.put(
  '/:id',
  ...attendancePolicy.requireHrOrAdmin,
  attendanceValidator.validateIdParam,
  attendanceValidator.validateUpdate,
  attendanceController.update,
);
router.delete(
  '/:id',
  ...attendancePolicy.requireHrOrAdmin,
  attendanceValidator.validateIdParam,
  attendanceController.remove,
);

export default router;
