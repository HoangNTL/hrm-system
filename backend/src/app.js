import express from 'express';
import cookieParser from 'cookie-parser';

import { createCorsMiddleware } from './config/cors.js';
import authRoutes from './modules/auth/auth.route.js';
import userRoutes from './modules/users/user.route.js';
import employeeRoutes from './modules/employees/employee.route.js';
import departmentRoutes from './modules/departments/department.route.js';
import positionRoutes from './modules/positions/position.route.js';
import contractRoutes from './modules/contracts/contract.route.js';
import attendanceRoutes from './modules/attendance/attendance.route.js';
import attendanceRequestRoutes from './modules/attendance-requests/attendanceRequest.route.js';
import payrollRoutes from './modules/payroll/payroll.route.js';
import shiftRoutes from './modules/shifts/shift.route.js';
import { errorHandler } from './shared/middlewares/error.middleware.js';

const app = express();
app.use(createCorsMiddleware());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.get('/', (req, res) => {
  res.send('HRM System API is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/attendance-requests', attendanceRequestRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/shifts', shiftRoutes);

// Error handling middleware
app.use(errorHandler);

export default app;
