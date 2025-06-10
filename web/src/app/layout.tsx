import Link from 'next/link';
import { ReactNode } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import './globals.css';

export const metadata = {
  title: 'SmartPool Admin',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              SmartPool
            </Typography>
            <Box>
              <Button color="inherit" component={Link} href="/dashboard">
                Dashboard
              </Button>
              <Button color="inherit" component={Link} href="/login">
                Logout
              </Button>
            </Box>
          </Toolbar>
        </AppBar>
        <Box sx={{ mt: 2 }}>{children}</Box>
      </body>
    </html>
  );
}
