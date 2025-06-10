import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import bcrypt from 'bcrypt';
import { verifyJwt } from '../../../../../lib/auth';

async function requireAdmin(request: Request) {
  const cookie = request.headers.get('cookie') || '';
  const token  = Object.fromEntries(cookie.split('; ').map(c => c.split('='))).auth;
  const payload = verifyJwt(token);
  if (!payload?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return null;
}

export async function GET(request: Request) {
  const forbidden = await requireAdmin(request);
  if (forbidden) return forbidden;

  const users = await prisma.user.findMany({
    select: { id: true, email: true, isAdmin: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const forbidden = await requireAdmin(request);
  if (forbidden) return forbidden;

  const { email, password, isAdmin } = (await request.json()) as {
    email: string;
    password: string;
    isAdmin: boolean;
  };

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, password: hashed, isAdmin },
    select: { id: true, email: true, isAdmin: true, createdAt: true },
  });

  return NextResponse.json(user, { status: 201 });
}
