import express from 'express';
import {
  getPositions,
  getPositionById,
  createPosition,
  updatePosition,
  deletePosition,
} from '../controllers/position.controller.js';
import { verifyToken, verifyRole } from '../middlewares/auth.js';
import { HR_ADMIN_ROLES } from '../utils/roles.js';

const router = express.Router();

router.use(verifyToken, verifyRole(HR_ADMIN_ROLES));

// Position routes
router.get('/', getPositions);
router.post('/', createPosition);
router.get('/:id', getPositionById);
router.put('/:id', updatePosition);
router.delete('/:id', deletePosition);

export default router;
