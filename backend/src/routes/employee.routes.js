import express from 'express';
import { getEmployees, getEmployeeById } from '../controllers/employee.controller.js';

const router = express.Router();

router.get('/', getEmployees);
router.get('/:id', getEmployeeById);

export default router;