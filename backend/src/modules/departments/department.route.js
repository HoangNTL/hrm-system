import express from 'express';

import { departmentController } from './department.controller.js';
import { departmentPolicy } from './department.policy.js';
import { departmentValidator } from './department.validator.js';

const router = express.Router();

router.use(...departmentPolicy.requireHrOrAdmin);
router.get('/', departmentValidator.validateListQuery, departmentController.getDepartments);
router.post('/', departmentValidator.validateCreate, departmentController.createDepartment);
router.get('/:id', departmentValidator.validateIdParam, departmentController.getDepartmentById);
router.put(
  '/:id',
  departmentValidator.validateIdParam,
  departmentValidator.validateUpdate,
  departmentController.updateDepartment,
);
router.delete('/:id', departmentValidator.validateIdParam, departmentController.deleteDepartment);

export default router;
