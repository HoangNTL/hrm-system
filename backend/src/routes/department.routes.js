import express from 'express';
import {
  getDepartments,
  getDepartmentById,
} from '../controllers/department.controller.js';
import { createDepartment } from '../controllers/department.controller.js';

const router = express.Router();

router.get('/', getDepartments);
router.post('/', createDepartment);
router.get('/:id', getDepartmentById);

export default router;
