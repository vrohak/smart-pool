'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Card,
  CardContent,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Select,
  MenuItem,
  Switch,
  FormControl,
  InputLabel,
  TextField,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Line
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DataPoint {
  timestamp: string;
  value: number;
}


export default function DashboardPage() {
  const pools = ['pool1', 'pool2'];
  const [selectedPool, setSelectedPool] = useState<string>(pools[0]);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));

  const [waterTempData, setWaterTempData] = useState<DataPoint[]>([]);
  const [airTempData, setAirTempData] = useState<DataPoint[]>([]);
  const [chlorineData, setChlorineData] = useState<DataPoint[]>([]);
  const [waterLevelData, setWaterLevelData] = useState<DataPoint[]>([]);
  const [uptimeData, setUptimeData] = useState<DataPoint[]>([]);

  const [heaterOn, setHeaterOn] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    const sensors = ['water_temp', 'air_temp', 'chlorine', 'water_level'];
    sensors.forEach((sensor) => {
      fetch(`/api/sensors?poolId=${selectedPool}&sensor=${sensor}&date=${date}`)
        .then((res) => res.json())
        .then((data: DataPoint[]) => {
          switch (sensor) {
            case 'water_temp':
              setWaterTempData(data);
              break;
            case 'air_temp':
              setAirTempData(data);
              break;
            case 'chlorine':
              setChlorineData(data);
              break;
            case 'water_level':
              setWaterLevelData(data);
              break;
          }
        })
        .catch((err) => {
          console.error(err);
          setSnackbar({ open: true, message: 'Greška pri dohvaćanju podataka', severity: 'error' });
        });
    });
  }, [selectedPool, date]);

  const handleToggleHeater = async () => {
    const newState = !heaterOn;
    try {
      const res = await fetch('/api/heater/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poolId: selectedPool, state: newState ? 'on' : 'off' }),
      });
      if (!res.ok) throw new Error(await res.text());
      setHeaterOn(newState);
      setSnackbar({ open: true, message: `Grijač je sada ${newState ? 'uključen' : 'isključen'}`, severity: 'success' });
    } catch (err: any) {
      console.error(err);
      setSnackbar({ open: true, message: err.message || 'Greška pri slanju komande', severity: 'error' });
    }
  };

  const makeLineChart = (label: string, data: DataPoint[], color?: string) => {
    const labels = data.map(d => {
      const iso = d.time.split('.')[0] + 'Z';
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });
    const values = data.map(d => d.value);
    return {
      labels,
      datasets: [
        {
          label,
          data: values,
          borderColor: color || 'rgba(75,192,192,1)',
          backgroundColor: color ? color.replace('1)', '0.2)') : 'rgba(75,192,192,0.2)',
          tension: 0.4,
        },
      ],
    };
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Pool i datum */}
        <Grid size={{ xs: 12, md: 12 }}>
          <Paper sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel id="pool-select-label">Pool</InputLabel>
              <Select
                labelId="pool-select-label"
                label="Pool"
                value={selectedPool}
                onChange={(e) => setSelectedPool(e.target.value as string)}
              >
                {pools.map((p) => (
                  <MenuItem key={p} value={p}>{p}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Datum"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            <Button onClick={() => {
              const d = new Date(date);
              d.setDate(d.getDate() - 1);
              setDate(d.toISOString().slice(0, 10));
            }}>◀</Button>

            <Button onClick={() => {
              const d = new Date(date);
              d.setDate(d.getDate() + 1);
              setDate(d.toISOString().slice(0, 10));
            }}>▶</Button>

            <Switch
              checked={heaterOn}
              onChange={handleToggleHeater}
              inputProps={{ 'aria-label': 'heater switch' }}
            />
            <Typography>{heaterOn ? 'Grijač uključen' : 'Grijač isključen'}</Typography>
          </Paper>
        </Grid>

        {/* Grafovi senzora */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Temperatura vode ({date})</Typography>
            <Box sx={{ height: 250, position: 'relative' }}>
              <Line data={makeLineChart('Water Temp', waterTempData)} options={{ maintainAspectRatio: false }} />
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Temperatura zraka ({date})</Typography>
            <Box sx={{ height: 250, position: 'relative' }}>
              <Line data={makeLineChart('Air Temp', airTempData, 'rgba(255,99,132,1)')} options={{ maintainAspectRatio: false }} />
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Razina klora ({date})</Typography>
            <Box sx={{ height: 250, position: 'relative' }}>
              <Line data={makeLineChart('Chlorine', chlorineData, 'rgba(54,162,235,1)')} options={{ maintainAspectRatio: false }} />
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Razina vode ({date})</Typography>
            <Box sx={{ height: 250, position: 'relative' }}>
              <Line data={makeLineChart('Water Level', waterLevelData, 'rgba(255,206,86,1)')} options={{ maintainAspectRatio: false }} />
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 12 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Uptime / Downtime ({date})</Typography>
            <Box sx={{ height: 200, position: 'relative' }}>
              <Line data={makeLineChart('Uptime (1=UP,0=DOWN)', uptimeData, 'rgba(153,102,255,1)')} options={{ maintainAspectRatio: false, scales: { y: { min: 0, max: 1, ticks: { stepSize: 1 } } } }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}