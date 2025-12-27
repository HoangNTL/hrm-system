import { prisma } from '../src/config/db.js';
import logger from '../src/utils/logger.js';
import bcrypt from 'bcrypt';

async function main() {
  // console.log("Seeding...");
  logger.info('Seeding...');

  // Xóa attendance hôm nay để test lại
  const today = new Date();
  // Set date at noon to avoid timezone conversion issues
  today.setHours(12, 0, 0, 0);
  
  const deletedCount = await prisma.attendance.deleteMany({
    where: { date: today }
  });
  logger.info(`Deleted ${deletedCount.count} attendance records for today`);

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

  // Upsert shifts - 2 ca để test (ca ngắn để dễ test)
  const now = new Date();
  
  // CA 1: Bắt đầu 25 phút trước → check-in muộn
  // Kết thúc sau 45 phút (tổng 45 phút) → có thể test check-out ngay
  const shift1StartVN = new Date(now.getTime() - 25 * 60 * 1000); // Trừ 25 phút
  const shift1EndVN = new Date(shift1StartVN.getTime() + 45 * 60 * 1000); // +45 phút
  
  const s1StartHour = shift1StartVN.getHours();
  const s1StartMin = shift1StartVN.getMinutes();
  const s1EndHour = shift1EndVN.getHours();
  const s1EndMin = shift1EndVN.getMinutes();
  
  // Convert VN → UTC (trừ 7 giờ)
  const s1StartUTCHour = (s1StartHour - 7 + 24) % 24;
  const s1EndUTCHour = (s1EndHour - 7 + 24) % 24;
  
  const shift1Start = new Date(`1970-01-01T${s1StartUTCHour.toString().padStart(2, '0')}:${s1StartMin.toString().padStart(2, '0')}:00Z`);
  const shift1End = new Date(`1970-01-01T${s1EndUTCHour.toString().padStart(2, '0')}:${s1EndMin.toString().padStart(2, '0')}:00Z`);
  
  console.log(`Ca 1 (Test muộn + checkout) - VN: ${s1StartHour}:${s1StartMin} - ${s1EndHour}:${s1EndMin}`);

  await prisma.shift.upsert({
    where: { id: 1 },
    update: {
      start_time: shift1Start,
      end_time: shift1End,
    },
    create: {
      shift_name: 'Ca sáng',
      start_time: shift1Start,
      end_time: shift1End,
      early_check_in_minutes: 15,
      late_checkout_minutes: 15,
    },
  });

  // CA 2: Bắt đầu 5 phút trước → test check-in đúng giờ
  // Kết thúc sau 45 phút (tổng 45 phút) → có thể test check-out ngay
  const shift2StartVN = new Date(now.getTime() - 5 * 60 * 1000); // Trừ 5 phút
  const shift2EndVN = new Date(shift2StartVN.getTime() + 45 * 60 * 1000); // +45 phút
  
  const s2StartHour = shift2StartVN.getHours();
  const s2StartMin = shift2StartVN.getMinutes();
  const s2EndHour = shift2EndVN.getHours();
  const s2EndMin = shift2EndVN.getMinutes();
  
  // Convert VN → UTC (trừ 7 giờ)
  const s2StartUTCHour = (s2StartHour - 7 + 24) % 24;
  const s2EndUTCHour = (s2EndHour - 7 + 24) % 24;
  
  const shift2Start = new Date(`1970-01-01T${s2StartUTCHour.toString().padStart(2, '0')}:${s2StartMin.toString().padStart(2, '0')}:00Z`);
  const shift2End = new Date(`1970-01-01T${s2EndUTCHour.toString().padStart(2, '0')}:${s2EndMin.toString().padStart(2, '0')}:00Z`);
  
  console.log(`Ca 2 (Test đúng giờ) - VN: ${s2StartHour}:${s2StartMin} - ${s2EndHour}:${s2EndMin}`);

  await prisma.shift.upsert({
    where: { id: 2 },
    update: {
      start_time: shift2Start,
      end_time: shift2End,
    },
    create: {
      shift_name: 'Ca chiều',
      start_time: shift2Start,
      end_time: shift2End,
      early_check_in_minutes: 15,
      late_checkout_minutes: 15,
    },
  });

  // XÓA CA 3 (không cần thiết cho test)
  await prisma.shift.deleteMany({
    where: { id: 3 }
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
