import express from 'express';

import { positionController } from './position.controller.js';
import { positionPolicy } from './position.policy.js';
import { positionValidator } from './position.validator.js';

const router = express.Router();

router.use(...positionPolicy.requireHrOrAdmin);
router.get('/', positionValidator.validateListQuery, positionController.getPositions);
router.post('/', positionValidator.validateCreate, positionController.createPosition);
router.get('/:id', positionValidator.validateIdParam, positionController.getPositionById);
router.put('/:id', positionValidator.validateIdParam, positionValidator.validateUpdate, positionController.updatePosition);
router.delete('/:id', positionValidator.validateIdParam, positionController.deletePosition);

export default router;
