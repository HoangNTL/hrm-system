import express from 'express';
import {
  getPositions,
  getPositionById,
  createPosition,
  updatePosition,
  deletePosition,
} from '../controllers/position.controller.js';

const router = express.Router();
// Position routes
router.get('/', getPositions);
router.post('/', createPosition);
router.get('/:id', getPositionById);
router.put('/:id', updatePosition);
router.delete('/:id', deletePosition);

export default router;
