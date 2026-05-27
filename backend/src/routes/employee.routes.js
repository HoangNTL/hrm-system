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
import { verifyToken, verifyRole } from '../middlewares/auth.js';
import { HR_ADMIN_ROLES } from '../utils/roles.js';

const router = express.Router();

// Employee routes
router.use(verifyToken, verifyRole(HR_ADMIN_ROLES));
router.get('/', getEmployees);
router.get('/select/list', getEmployeesForSelect);
router.get('/select/without-user', getEmployeesForSelectWithoutUser);
router.get('/select/with-user', getEmployeesForSelectWithUser);
router.post('/', createEmployee);
router.get('/:id', getEmployeeById);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

export default router;
