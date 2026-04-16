import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { env } from '../config/env';

/**
 * Generates a JWT token and sets it as an HTTP-only cookie.
 * 
 * @param res - Express Response object to set the cookie on
 * @param userId - Unique identifier of the user to encode in the token
 * @returns The generated JWT string
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
    sameSite: 'lax', // 'lax' is required for Stripe redirect flows to maintain session
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  return token;
}

/**
 * Clears the JWT authentication cookie by setting it to an empty string and expiring it.
 * 
 * @param res - Express Response object
 */
export function clearToken(res: Response): void {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}
