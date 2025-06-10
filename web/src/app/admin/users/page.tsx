'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel,
  Snackbar,
  Alert,
} from '@mui/material';

interface User {
  id: number;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success'|'error' }>({open:false, message:'', severity:'success'});

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(setUsers)
      .catch(err => {
        console.error(err);
        setSnackbar({open:true, message:'Failed to load users', severity:'error'});
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const submitNew = async () => {
    try {
      const res = await fetch('/api/admin/users', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ email, password, isAdmin })
      });
      if (!res.ok) throw new Error(await res.text());
      const user: User = await res.json();
      setUsers([user, ...users]);
      setSnackbar({open:true, message:'User created', severity:'success'});
      handleClose();
    } catch (err:any) {
      setSnackbar({open:true, message:err.message, severity:'error'});
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm('Delete this user?')) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method:'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      setUsers(users.filter(u => u.id !== id));
      setSnackbar({open:true, message:'User deleted', severity:'success'});
    } catch (err:any) {
      setSnackbar({open:true, message:err.message, severity:'error'});
    }
  };

  return (
    <Container sx={{ mt:4 }}>
      <Typography variant="h4" gutterBottom>User Management</Typography>
      <Button variant="contained" onClick={handleCreate} sx={{ mb:2 }}>New User</Button>
      {loading ? (
        <Typography>Loading…</Typography>
      ) : (
        <Paper>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Admin?</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(u => (
                <TableRow key={u.id}>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.isAdmin ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{new Date(u.createdAt).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <Button color="error" size="small" onClick={()=>deleteUser(u.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>New User</DialogTitle>
        <DialogContent sx={{ display:'flex', flexDirection:'column', gap:2, width:300 }}>
          <TextField label="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <TextField label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <FormControlLabel
            control={<Checkbox checked={isAdmin} onChange={e=>setIsAdmin(e.target.checked)} />}
            label="Administrator"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={submitNew}>Create</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={()=>setSnackbar(s=>({...s,open:false}))}
      >
        <Alert severity={snackbar.severity} onClose={()=>setSnackbar(s=>({...s,open:false}))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}