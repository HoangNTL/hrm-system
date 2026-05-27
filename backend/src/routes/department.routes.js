import express from 'express';
import {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/department.controller.js';
import { verifyToken, verifyRole } from '../middlewares/auth.js';
import { HR_ADMIN_ROLES } from '../utils/roles.js';

const router = express.Router();

router.use(verifyToken, verifyRole(HR_ADMIN_ROLES));
router.get('/', getDepartments);
router.post('/', createDepartment);
router.get('/:id', getDepartmentById);
router.put('/:id', updateDepartment);
router.delete('/:id', deleteDepartment);

export default router;
