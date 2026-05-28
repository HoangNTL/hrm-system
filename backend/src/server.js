process.env.TZ = 'Asia/Ho_Chi_Minh';

import app from './app.js';
import { connectDB, disconnectDB } from './config/database.js';
import { env } from './config/env.js';
import logger from './shared/utils/logger.js';

connectDB();

const server = app.listen(env.PORT, () => {
  logger.info(`Server is running on http://localhost:${env.PORT}`);
});

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
