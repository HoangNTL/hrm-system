import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import logger from '../utils/logger.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

const prisma = new PrismaClient({
  adapter,
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'info', 'warn']
      : ['error'],
});

const connectDB = async () => {
  try {
    await prisma.$connect();
    // console.log("DB connected via Prisma");
    logger.info('DB connected via Prisma');
  } catch (error) {
    // console.error("DB connection error", error.message);
    logger.error('DB connection error', error.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await prisma.$disconnect();
};

export { prisma, connectDB, disconnectDB };
