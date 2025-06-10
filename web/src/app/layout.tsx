import Link from 'next/link';
import { ReactNode } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { cookies } from 'next/headers';
import { verifyJwt } from '../../lib/auth';
import LogoutButton from './components/LogoutButton';
import './globals.css';

export const metadata = {
  title: 'SmartPool Admin',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const authCookie  = cookieStore.get('auth')?.value;
  const payload     = verifyJwt(authCookie);

  const isLoggedIn = !!payload;
  const isAdmin    = payload?.isAdmin === true;

  return (
    <html lang="en">
      <body>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              SmartPool
            </Typography>

            <Box>
              {isLoggedIn ? (
                <>
                  <Button color="inherit" component={Link} href="/dashboard">
                    Dashboard
                  </Button>
                  {isAdmin && (
                    <Button color="inherit" component={Link} href="/admin/users">
                      User Management
                    </Button>
                  )}
                  <LogoutButton />
                </>
              ) : (
                <Button color="inherit" component={Link} href="/login">
                  Login
                </Button>
              )}
            </Box>
          </Toolbar>
        </AppBar>

        <Box sx={{ mt: 2 }}>{children}</Box>
      </body>
    </html>
  );
}