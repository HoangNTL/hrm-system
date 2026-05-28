import express from 'express';

import { employeeController } from './employee.controller.js';
import { employeePolicy } from './employee.policy.js';
import { employeeValidator } from './employee.validator.js';

const router = express.Router();

router.use(...employeePolicy.requireHrOrAdmin);
router.get('/', employeeValidator.validateListQuery, employeeController.getEmployees);
router.get('/select/list', employeeController.getEmployeesForSelect);
router.get('/select/without-user', employeeController.getEmployeesForSelectWithoutUser);
router.get('/select/with-user', employeeController.getEmployeesForSelectWithUser);
router.post('/', employeeValidator.validateCreate, employeeController.createEmployee);
router.get('/:id', employeeValidator.validateIdParam, employeeController.getEmployeeById);
router.put(
  '/:id',
  employeeValidator.validateIdParam,
  employeeValidator.validateUpdate,
  employeeController.updateEmployee,
);
router.delete('/:id', employeeValidator.validateIdParam, employeeController.deleteEmployee);

export default router;
