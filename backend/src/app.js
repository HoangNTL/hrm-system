import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import employeeRoutes from './routes/employee.routes.js';
import departmentRoutes from './routes/department.routes.js';
import positionRoutes from './routes/position.routes.js';
import contractRoutes from './routes/contract.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import attendanceRequestRoutes from './routes/attendanceRequest.routes.js';
import payrollRoutes from './routes/payroll.routes.js';
import shiftRoutes from './routes/shift.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

const FRONTEND_ORIGIN = process.env.FRONTEND_URL || 'http://localhost:5173';
const corsOrigins = [
  FRONTEND_ORIGIN,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || corsOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-refresh-token'],
  }),
);

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
