import express from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeesForSelect,
  getEmployeesForSelectWithoutUser,
  getEmployeesForSelectWithUser,
} from '../controllers/employee.controller.js';

const router = express.Router();

// Employee routes
router.get('/', getEmployees);
router.get('/select/list', getEmployeesForSelect);
router.get('/select/without-user', getEmployeesForSelectWithoutUser);
router.get('/select/with-user', getEmployeesForSelectWithUser);
router.post('/', createEmployee);
router.get('/:id', getEmployeeById);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

export default router;
