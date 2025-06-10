import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'nemojovoopa';

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = cookie.parse(cookieHeader);
    const token = cookies.auth;

    if (!token) {
      return NextResponse.json(
        { error: 'Niste ulogirani.' },
        { status: 401 }
      );
    }

    const payload = jwt.verify(token, JWT_SECRET) as {
      userId: number;
      isAdmin: boolean;
    };

    return NextResponse.json(
      { userId: payload.userId, isAdmin: payload.isAdmin },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Neispravan token ili isteklo vrijeme.' },
      { status: 401 }
    );
  }
}