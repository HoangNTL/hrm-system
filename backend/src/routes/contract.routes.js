import express from 'express';
import {
  getContracts,
  getContractById,
  createContract,
  updateContract,
  deleteContract,
} from '../controllers/contract.controller.js';
import { verifyToken, verifyRole } from '../middlewares/auth.js';
import { HR_ADMIN_ROLES } from '../utils/roles.js';

const router = express.Router();

router.use(verifyToken, verifyRole(HR_ADMIN_ROLES));
router.get('/', getContracts);
router.post('/', createContract);
router.get('/:id', getContractById);
router.put('/:id', updateContract);
router.delete('/:id', deleteContract);

export default router;
