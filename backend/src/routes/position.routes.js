import express from 'express';
import { getPositions, getPositionById } from '../controllers/position.controller.js';

const router = express.Router();

router.get('/', getPositions);
router.get('/:id', getPositionById);

export default router;
