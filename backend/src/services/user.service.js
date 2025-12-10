import bcrypt from 'bcrypt';
import { prisma } from '../config/db.js';

// Generate secure password
export const generatePassword = () => {
  const length = 12;
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  
  const allChars = uppercase + lowercase + numbers + symbols;
  let password = '';
  
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

export const createUserAccount = async ({ email, employee_id, role = 'STAFF' }) => {
  // Validate email
  if (!email || !email.trim()) {
    throw new Error('Email is required to create user account');
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('User account with this email already exists');
  }

  // Generate secure password
  const plainPassword = generatePassword();
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password_hash: hashedPassword,
      role,
      employee_id: employee_id || null,
    },
  });

  return {
    user_id: user.id,
    email: user.email,
    password: plainPassword, // Return plain password to send to user
    role: user.role,
  };
};

export const getUserByEmail = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

export const resetUserPassword = async (userId) => {
  const plainPassword = generatePassword();
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const user = await prisma.user.update({
    where: { id: userId },
    data: { password_hash: hashedPassword },
  });

  return {
    user_id: user.id,
    email: user.email,
    password: plainPassword,
  };
};
