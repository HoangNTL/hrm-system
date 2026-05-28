import express from 'express';

import { contractController } from './contract.controller.js';
import { contractPolicy } from './contract.policy.js';
import { contractValidator } from './contract.validator.js';

const router = express.Router();

router.use(...contractPolicy.requireHrOrAdmin);
router.get('/', contractValidator.validateListQuery, contractController.getContracts);
router.post('/', contractValidator.validateCreate, contractController.createContract);
router.get('/:id', contractValidator.validateIdParam, contractController.getContractById);
router.put('/:id', contractValidator.validateIdParam, contractValidator.validateUpdate, contractController.updateContract);
router.delete('/:id', contractValidator.validateIdParam, contractController.deleteContract);

export default router;
