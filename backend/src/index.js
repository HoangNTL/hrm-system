import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';
// import https from 'https';
// import fs from 'fs';
import cookieParser from 'cookie-parser';
// import path from 'path';

import { connectDB, disconnectDB } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import employeeRoutes from './routes/employee.routes.js';
import departmentRoutes from './routes/department.routes.js';
import positionRoutes from './routes/position.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import logger from './utils/logger.js';

config();
connectDB();

const app = express();
const PORT = process.env.PORT;
// HTTPS options
// const options = {
//   key: fs.readFileSync(path.join(process.cwd(), 'certs', 'localhost-key.pem')),
//   cert: fs.readFileSync(path.join(process.cwd(), 'certs', 'localhost.pem')),
// };

const FRONTEND_ORIGIN = process.env.FRONTEND_URL;
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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

// Error handling middleware
app.use(errorHandler);

const server = app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});

// const server = https.createServer(options, app).listen(PORT, () => {
//   console.log(`Server is running on https://localhost:${PORT}`);
// });

// Process listeners
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

process.on('uncaughtException', async (err) => {
  logger.error('Uncaught Exception:', err);
  await disconnectDB();
  process.exit(1);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully');
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
});
