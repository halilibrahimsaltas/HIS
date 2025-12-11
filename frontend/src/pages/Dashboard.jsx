import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ScienceIcon from '@mui/icons-material/Science';
import api from '../api/axios';

export default function Dashboard() {
  const [stats, setStats] = useState({
    patients: 0,
    orders: 0,
    tests: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [patientsRes, ordersRes, testsRes] = await Promise.all([
          api.get('/patients'),
          api.get('/orders'),
          api.get('/tests'),
        ]);
        setStats({
          patients: patientsRes.data.length,
          orders: ordersRes.data.length,
          tests: testsRes.data.length,
        });
      } catch (error) {
        console.error('İstatistikler yüklenemedi:', error);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Toplam Hasta', value: stats.patients, icon: <PeopleIcon />, color: '#1976d2' },
    { title: 'Test İstemi', value: stats.orders, icon: <AssignmentIcon />, color: '#2e7d32' },
    { title: 'Test Sayısı', value: stats.tests, icon: <ScienceIcon />, color: '#ed6c02' },
  ];

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ color: card.color, mr: 2, fontSize: 40 }}>
                    {card.icon}
                  </Box>
                  <Box>
                    <Typography variant="h4">{card.value}</Typography>
                    <Typography color="text.secondary">{card.title}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

