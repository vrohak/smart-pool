import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET env variable');
}

export interface JwtPayload {
  userId: number;
  isAdmin: boolean;
  iat?: number;
  exp?: number;
}

export function verifyJwt(token: string | undefined): JwtPayload | null {
  if (!token) return null;
  try {
    const raw = token.startsWith('Bearer ') ? token.slice(7) : token;
    return jwt.verify(raw, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}