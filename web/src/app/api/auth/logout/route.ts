import { NextResponse } from 'next/server';
import cookie from 'cookie';

export async function POST() {
  const res = NextResponse.json({ message: 'Logged out' });
  res.headers.set(
    'Set-Cookie',
    cookie.serialize('auth', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
  );
  return res;
}