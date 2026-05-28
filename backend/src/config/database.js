import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/index.js';
import { env } from './env.js';
import logger from '../shared/utils/logger.js';

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

const prisma = new PrismaClient({
  adapter,
  log: env.NODE_ENV === 'development' ? ['query', 'info', 'warn'] : ['error'],
});

const connectDB = async () => {
  try {
    await prisma.$connect();
    logger.info('DB connected via Prisma');
  } catch (error) {
    logger.error('DB connection error', error.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await prisma.$disconnect();
};

export { prisma, connectDB, disconnectDB };
