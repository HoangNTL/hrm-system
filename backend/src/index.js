// Set timezone to Vietnam
process.env.TZ = 'Asia/Ho_Chi_Minh';

import { config } from 'dotenv';
import app from './app.js';
import logger from './utils/logger.js';
import { connectDB, disconnectDB } from './config/db.js';

config();
connectDB();

const PORT = process.env.PORT;
// HTTPS options
// const options = {
//   key: fs.readFileSync(path.join(process.cwd(), 'certs', 'localhost-key.pem')),
//   cert: fs.readFileSync(path.join(process.cwd(), 'certs', 'localhost.pem')),
// };

if (process.env.NODE_ENV !== 'production') {
  import('dotenv/config');
}

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
