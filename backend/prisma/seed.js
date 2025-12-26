import { prisma } from '../src/config/db.js';
import logger from '../src/utils/logger.js';
import bcrypt from 'bcrypt';

async function main() {
  // console.log("Seeding...");
  logger.info('Seeding...');

  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Upsert admin
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      password_hash: hashedPassword,
      role: 'ADMIN',
      is_locked: false,
      must_change_password: false,
    },
    create: {
      email: 'admin@example.com',
      password_hash: hashedPassword,
      role: 'ADMIN',
    },
  });

  // Upsert HR user
  await prisma.user.upsert({
    where: { email: 'hr@example.com' },
    update: {
      password_hash: hashedPassword,
      role: 'HR',
      is_locked: false,
      must_change_password: false,
    },
    create: {
      email: 'hr@example.com',
      password_hash: hashedPassword,
      role: 'HR',
    },
  });

  // Upsert STAFF employee + user for testing
  const staffEmployee = await prisma.employee.upsert({
    where: { email: 'staff@example.com' },
    update: {},
    create: {
      full_name: 'Test Staff',
      email: 'staff@example.com',
      hire_date: new Date(),
      work_status: 'working'
    }
  });

  await prisma.user.upsert({
    where: { email: 'staff@example.com' },
    update: {
      password_hash: hashedPassword,
      role: 'STAFF',
      is_locked: false,
      must_change_password: false,
      employee_id: staffEmployee.id
    },
    create: {
      email: 'staff@example.com',
      password_hash: hashedPassword,
      role: 'STAFF',
      employee_id: staffEmployee.id
    }
  });

  // Upsert shifts - For testing, create shifts near current time
  // Use explicit UTC time with 'Z' suffix
  // Current time: 19:44 VN = 12:44 UTC
  // Ca sáng: 09:00-10:00 UTC (16:00-17:00 VN) - đã qua
  await prisma.shift.upsert({
    where: { id: 1 },
    update: {
      start_time: new Date('1970-01-01T09:00:00Z'),
      end_time: new Date('1970-01-01T10:00:00Z'),
    },
    create: {
      shift_name: 'Ca sáng',
      start_time: new Date('1970-01-01T09:00:00Z'),
      end_time: new Date('1970-01-01T10:00:00Z'),
      early_check_in_minutes: 15,
      late_checkout_minutes: 15,
    },
  });

  // Ca chiều: 10:00-11:00 UTC (17:00-18:00 VN) - đã qua
  await prisma.shift.upsert({
    where: { id: 2 },
    update: {
      start_time: new Date('1970-01-01T10:00:00Z'),
      end_time: new Date('1970-01-01T11:00:00Z'),
    },
    create: {
      shift_name: 'Ca chiều',
      start_time: new Date('1970-01-01T10:00:00Z'),
      end_time: new Date('1970-01-01T11:00:00Z'),
      early_check_in_minutes: 15,
      late_checkout_minutes: 15,
    },
  });

  // Ca tối: 12:30-14:00 UTC (19:30-21:00 VN) - đang diễn ra, có thể test
  await prisma.shift.upsert({
    where: { id: 3 },
    update: {
      start_time: new Date('1970-01-01T12:30:00Z'),
      end_time: new Date('1970-01-01T14:00:00Z'),
    },
    create: {
      shift_name: 'Ca tăng ca (OT)',
      start_time: new Date('1970-01-01T12:30:00Z'),
      end_time: new Date('1970-01-01T14:00:00Z'),
      early_check_in_minutes: 15,
      late_checkout_minutes: 15,
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
