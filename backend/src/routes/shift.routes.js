import express from 'express';
import {
  getShifts,
  getShiftById,
  createShift,
  updateShift,
  deleteShift,
} from '../controllers/shift.controller.js';

const router = express.Router();

router.get('/', getShifts);
router.post('/', createShift);
router.get('/:id', getShiftById);
router.put('/:id', updateShift);
router.delete('/:id', deleteShift);

export default router;
