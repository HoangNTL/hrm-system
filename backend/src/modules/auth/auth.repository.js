import { prisma } from '../../config/database.js';

const loginUserSelect = {
  id: true,
  email: true,
  password_hash: true,
  role: true,
  employee_id: true,
  is_locked: true,
  is_deleted: true,
  must_change_password: true,
  employee: true,
};

export const authRepository = {
  findUserForLoginByEmail(email, db = prisma) {
    return db.user.findUnique({
      where: { email },
      select: loginUserSelect,
    });
  },

  updateLastLogin(userId, db = prisma) {
    return db.user.update({
      where: { id: userId },
      data: { last_login_at: new Date() },
    });
  },

  saveRefreshToken(userId, refreshTokenHash, refreshTokenExpiresAt, db = prisma) {
    return db.$executeRaw`
      UPDATE "users"
      SET
        "refresh_token_hash" = ${refreshTokenHash},
        "refresh_token_expires_at" = ${refreshTokenExpiresAt}
      WHERE "id" = ${userId}
    `;
  },

  clearRefreshToken(userId, db = prisma) {
    return db.$executeRaw`
      UPDATE "users"
      SET
        "refresh_token_hash" = NULL,
        "refresh_token_expires_at" = NULL
      WHERE "id" = ${userId}
    `;
  },

  async findUserForRefreshById(userId, db = prisma) {
    const rows = await db.$queryRaw`
      SELECT
        "id",
        "email",
        "role",
        "employee_id",
        "is_locked",
        "is_deleted",
        "refresh_token_hash",
        "refresh_token_expires_at"
      FROM "users"
      WHERE "id" = ${userId}
      LIMIT 1
    `;

    return rows[0] || null;
  },

  findUserSecurityById(userId, db = prisma) {
    return db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password_hash: true,
        must_change_password: true,
      },
    });
  },

  updatePassword(userId, passwordHash, mustChangePassword = false, db = prisma) {
    return db.user.update({
      where: { id: userId },
      data: {
        password_hash: passwordHash,
        must_change_password: mustChangePassword,
      },
    });
  },
};
