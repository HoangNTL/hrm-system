import express from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
} from '../controllers/employee.controller.js';

const router = express.Router();

router.get('/', getEmployees);
router.post('/', createEmployee);
router.get('/:id', getEmployeeById);

export default router;
