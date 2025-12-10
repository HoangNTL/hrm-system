import { prisma } from '../src/config/db.js';
import logger from '../src/utils/logger.js';
import bcrypt from 'bcrypt';

async function main() {
  // console.log("Seeding...");
  logger.info('Seeding...');

  const hashedPassword = await bcrypt.hash('admin123', 10);

  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password_hash: hashedPassword,
      role: 'ADMIN',
    },
  });

  // console.log("Seed done!");
  logger.info('Seed done!');
}

main()
  .catch((e) => {
    // console.error(e);
    logger.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
