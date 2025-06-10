'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@mui/material';

export default function LogoutButton() {
  const router = useRouter();
  const handle = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.refresh();
    router.push('/login');
  };
  return (
    <Button color="inherit" onClick={handle}>
      Logout
    </Button>
  );
}