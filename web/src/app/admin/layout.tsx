import { ReactNode } from 'react';
import { redirect }      from 'next/navigation';
import { cookies }       from 'next/headers';
import { verifyJwt }     from '../../../lib/auth';

export const metadata = {
  title: 'Admin',
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const authCookie  = cookieStore.get('auth')?.value;
  const payload     = verifyJwt(authCookie);

  if (!payload?.isAdmin) {
    redirect('/login');
  }

  return <>{children}</>;
}