import { NextResponse } from 'next/server';
import prisma from '../../../../../../lib/prisma';
import { verifyJwt } from '../../../../../../lib/auth';

async function requireAdmin(request: Request) {
  const cookie = request.headers.get('cookie') || '';
  const token  = Object.fromEntries(cookie.split(';').map(c => c.trim().split('='))).auth;
  const payload = verifyJwt(token);
  if (!payload?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return payload;
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {

  const result = await requireAdmin(request);
    if (result instanceof NextResponse) {
    return result;
    }
  const payload = result;

  const { id } = await params;
  const userId = Number(id);
  if (Number.isNaN(userId)) {
    return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, isAdmin: true, createdAt: true }
  });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (user.id === payload.userId) {
    return NextResponse.json(
      { error: "You can't delete your own account" },
      { status: 400 }
    );
  }

  if (user.isAdmin) {
    const oldest = await prisma.user.findFirst({
      where: { isAdmin: true },
      orderBy: { createdAt: 'asc' },
      select: { id: true }
    });
    if (oldest && oldest.id === user.id) {
      return NextResponse.json(
        { error: "You can't delete the oldest admin" },
        { status: 400 }
      );
    }
  }

  await prisma.user.delete({ where: { id: userId } });
  return NextResponse.json({ message: 'User deleted' }, { status: 200 });
}