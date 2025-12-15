import express from 'express';
import {
  getContracts,
  getContractById,
  createContract,
  updateContract,
  deleteContract,
} from '../controllers/contract.controller.js';

const router = express.Router();

router.get('/', getContracts);
router.post('/', createContract);
router.get('/:id', getContractById);
router.put('/:id', updateContract);
router.delete('/:id', deleteContract);

export default router;
