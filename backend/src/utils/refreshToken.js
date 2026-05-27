import crypto from 'crypto';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const REFRESH_TOKEN_TTL_MS = 7 * DAY_IN_MS;

function getRefreshTokenHashSecret() {
  return (
    process.env.REFRESH_TOKEN_HASH_SECRET ||
    process.env.JWT_REFRESH_SECRET ||
    process.env.JWT_SECRET
  );
}

export function getRefreshTokenExpiryDate(now = Date.now()) {
  return new Date(now + REFRESH_TOKEN_TTL_MS);
}

export function hashRefreshToken(token) {
  const secret = getRefreshTokenHashSecret();
  if (!secret) {
    throw new Error('Refresh token hash secret is not configured');
  }

  return crypto.createHmac('sha256', secret).update(token).digest('hex');
}

export function refreshTokenMatchesHash(storedHash, token) {
  if (!storedHash || !token) {
    return false;
  }

  const candidateHash = hashRefreshToken(token);
  const storedBuffer = Buffer.from(storedHash, 'hex');
  const candidateBuffer = Buffer.from(candidateHash, 'hex');

  if (storedBuffer.length !== candidateBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(storedBuffer, candidateBuffer);
}

export function getRefreshTokenCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: REFRESH_TOKEN_TTL_MS,
    path: '/',
  };
}
