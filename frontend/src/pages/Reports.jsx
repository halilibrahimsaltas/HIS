import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Reports() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('daily'); // 'daily' or 'range'
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'ADMIN' || user?.role === 'CHIEF_PHYSICIAN') {
      fetchReport();
    }
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      let response;
      if (reportType === 'daily') {
        response = await api.get(`/reports/daily?date=${date}`);
      } else {
        response = await api.get(`/reports/range?startDate=${startDate}&endDate=${endDate}`);
      }
      setReportData(response.data);
    } catch (error) {
      console.error('Rapor yüklenemedi:', error);
      alert('Rapor yüklenirken hata oluştu: ' + (error.response?.data?.message || 'Bilinmeyen hata'));
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(value);
  };

  if (user?.role !== 'ADMIN' && user?.role !== 'CHIEF_PHYSICIAN') {
    return (
      <Container>
        <Typography variant="h4" sx={{ mt: 3 }}>
          Yetkiniz yok
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ mb: 3, mt: 3 }}>
        <Typography variant="h4" gutterBottom>
          Raporlar
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Şubelere göre günlük test sayısı ve hasılat bilgileri
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Rapor Tipi</InputLabel>
                <Select
                  value={reportType}
                  label="Rapor Tipi"
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <MenuItem value="daily">Günlük Rapor</MenuItem>
                  <MenuItem value="range">Tarih Aralığı</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {reportType === 'daily' ? (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tarih"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            ) : (
              <>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Başlangıç Tarihi"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Bitiş Tarihi"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} sm={3}>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={fetchReport}
                disabled={loading}
                fullWidth
              >
                Raporu Getir
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {reportData && (
        <>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Özet Bilgiler
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {reportData.total.totalOrders}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Toplam Sipariş
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {reportData.total.totalTests}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Toplam Test
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {formatCurrency(reportData.total.totalRevenue)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Toplam Hasılat
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Şube</strong></TableCell>
                  <TableCell><strong>Şube Kodu</strong></TableCell>
                  <TableCell align="right"><strong>Sipariş Sayısı</strong></TableCell>
                  <TableCell align="right"><strong>Test Sayısı</strong></TableCell>
                  <TableCell align="right"><strong>Hasılat</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.branchStats.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary">
                        Seçilen tarih aralığında veri bulunamadı.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  reportData.branchStats.map((branch) => (
                    <TableRow key={branch.branchId || 'no-branch'}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {branch.branchName}
                          {branch.branchId === null && (
                            <Chip label="Şube Yok" size="small" color="warning" />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{branch.branchCode}</TableCell>
                      <TableCell align="right">{branch.totalOrders}</TableCell>
                      <TableCell align="right">{branch.totalTests}</TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(branch.totalRevenue)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Container>
  );
}

