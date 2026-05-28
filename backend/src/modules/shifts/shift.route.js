import express from 'express';

import { shiftController } from './shift.controller.js';
import { shiftPolicy } from './shift.policy.js';
import { shiftValidator } from './shift.validator.js';

const router = express.Router();

router.use(...shiftPolicy.requireHrOrAdmin);
router.get('/', shiftValidator.validateListQuery, shiftController.getShifts);
router.post('/', shiftValidator.validateCreate, shiftController.createShift);
router.get('/:id', shiftValidator.validateIdParam, shiftController.getShiftById);
router.put('/:id', shiftValidator.validateIdParam, shiftValidator.validateUpdate, shiftController.updateShift);
router.delete('/:id', shiftValidator.validateIdParam, shiftController.deleteShift);

export default router;
