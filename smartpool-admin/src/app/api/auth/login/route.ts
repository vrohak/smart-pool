import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as cookie from 'cookie';
import prisma from '../../../../../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'nemojovoopa';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json() as {
      email: string;
      password: string;
    };

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email i password su obavezni.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: 'Neispravni login podaci.' },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: 'Neispravni login podaci.' },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { userId: user.id, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    const setCookie = cookie.serialize('auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 2 * 60 * 60,
    });

    const response = NextResponse.json({ message: 'Uspješno ulogiran.' }, { status: 200 });
    response.headers.set('Set-Cookie', setCookie);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Došlo je do greške pri logiranju.' },
      { status: 500 }
    );
  }
}