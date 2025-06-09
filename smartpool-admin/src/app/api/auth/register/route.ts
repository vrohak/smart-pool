import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '../../../../../lib/prisma';

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


    const existing = await prisma.user.findUnique({
      where: { email },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'Korisnik s tim emailom već postoji.' },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { email, password: hashed, isAdmin: false },
    });

    return NextResponse.json({ message: 'Korisnik je uspješno kreiran.' }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Došlo je do greške pri registraciji.' },
      { status: 500 }
    );
  }
}