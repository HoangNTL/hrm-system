import express from 'express';
import {
  getShifts,
  getShiftById,
  createShift,
  updateShift,
  deleteShift,
} from '../controllers/shift.controller.js';
import { verifyToken, verifyRole } from '../middlewares/auth.js';
import { HR_ADMIN_ROLES } from '../utils/roles.js';

const router = express.Router();

router.use(verifyToken, verifyRole(HR_ADMIN_ROLES));
router.get('/', getShifts);
router.post('/', createShift);
router.get('/:id', getShiftById);
router.put('/:id', updateShift);
router.delete('/:id', deleteShift);

export default router;
