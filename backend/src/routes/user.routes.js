import express from 'express';
import { getAllUsers, createAccountForEmployee, resetPassword } from '../controllers/user.controller.js';

const router = express.Router();

router.get('/', getAllUsers);
router.post('/create-for-employee/:employeeId', createAccountForEmployee);
router.post('/reset-password/:userId', resetPassword);

export default router;
