import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { env } from '../config/env';

/**
 * Generates a JWT token and sets it as an HTTP-only cookie.
 */
export function generateToken(res: Response, userId: string): string {
  const token = jwt.sign(
    { userId },
    env.JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax', // Required 'none' for Vercel -> Render cross-domain
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  return token;
}

/**
 * Clears the JWT authentication cookie.
 */
export function clearToken(res: Response): void {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax', // Must perfectly match creation flags
  });
}