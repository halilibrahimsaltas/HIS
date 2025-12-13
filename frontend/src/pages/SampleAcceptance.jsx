import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const SAMPLE_STATUS_COLORS = {
  PENDING: 'default',
  ACCEPTED: 'success',
  IN_PROGRESS: 'info',
  COMPLETED: 'primary',
  REJECTED: 'error',
};

const SAMPLE_STATUS_LABELS = {
  PENDING: 'Beklemede',
  ACCEPTED: 'Kabul Edildi',
  IN_PROGRESS: 'İşlemde',
  COMPLETED: 'Tamamlandı',
  REJECTED: 'Reddedildi',
};

export default function SampleAcceptance() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [searchBarcode, setSearchBarcode] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const fetchPendingOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data.filter((o) => o.sampleStatus === 'PENDING'));
      setLoading(false);
    } catch (error) {
      console.error('Test istemleri yüklenemedi:', error);
      setLoading(false);
    }
  };

  const handleBarcodeSearch = async () => {
    if (!searchBarcode.trim()) return;

    try {
      // Önce OrderTest bazında ara
      try {
        const orderTestResponse = await api.get(`/orders/order-test/barcode/${searchBarcode}`);
        if (orderTestResponse.data) {
          setSelectedOrder(orderTestResponse.data.order);
          return;
        }
      } catch (err) {
        // OrderTest'te bulunamazsa Order'da ara
      }

      // Order bazında ara
      const response = await api.get(`/orders/barcode/${searchBarcode}`);
      if (response.data && response.data.order) {
        setSelectedOrder(response.data.order);
      } else if (response.data) {
        setSelectedOrder(response.data);
      } else {
        alert('Barkod bulunamadı');
      }
    } catch (error) {
      console.error('Barkod araması başarısız:', error);
      alert('Barkod bulunamadı');
    }
  };

  const handleAcceptSample = async (orderId) => {
    if (!window.confirm('Numuneyi kabul etmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      await api.post(`/orders/${orderId}/accept-sample`);
      alert('Numune başarıyla kabul edildi');
      fetchPendingOrders();
      if (selectedOrder?.id === orderId) {
        const updated = await api.get(`/orders/${orderId}`);
        setSelectedOrder(updated.data);
      }
    } catch (error) {
      console.error('Numune kabul edilemedi:', error);
      alert('Hata: ' + (error.response?.data?.message || 'Bilinmeyen hata'));
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/sample-status`, { status });
      fetchPendingOrders();
      if (selectedOrder?.id === orderId) {
        const updated = await api.get(`/orders/${orderId}`);
        setSelectedOrder(updated.data);
      }
    } catch (error) {
      console.error('Durum güncellenemedi:', error);
      alert('Hata: ' + (error.response?.data?.message || 'Bilinmeyen hata'));
    }
  };

  if (loading) {
    return <Container>Yükleniyor...</Container>;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Numune Kabul</Typography>
        <Button variant="outlined" onClick={() => navigate('/orders')}>
          Test İstemleri
        </Button>
      </Box>

      <Grid container spacing={2}>
        {/* Sol Panel - Bekleyen İstemler */}
        <Grid item xs={12} md={selectedOrder ? 5 : 12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Bekleyen Numuneler
            </Typography>

            {/* Barkod Arama */}
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Barkod ile Ara"
                value={searchBarcode}
                onChange={(e) => setSearchBarcode(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleBarcodeSearch();
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleBarcodeSearch}>
                        <QrCodeScannerIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Hasta</TableCell>
                    <TableCell>Test Sayısı</TableCell>
                    <TableCell>Durum</TableCell>
                    <TableCell align="right">İşlem</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow
                      key={order.id}
                      sx={{
                        cursor: 'pointer',
                        bgcolor: selectedOrder?.id === order.id ? 'action.selected' : 'inherit',
                      }}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <TableCell>{order.id}</TableCell>
                      <TableCell>
                        {order.patient.firstName} {order.patient.lastName}
                      </TableCell>
                      <TableCell>{order.tests.length}</TableCell>
                      <TableCell>
                        <Chip
                          label={SAMPLE_STATUS_LABELS[order.sampleStatus]}
                          size="small"
                          color={SAMPLE_STATUS_COLORS[order.sampleStatus]}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {order.sampleStatus === 'PENDING' && (
                          <IconButton
                            size="small"
                            color="success"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAcceptSample(order.id);
                            }}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Sağ Panel - Seçili İstem Detayı */}
        {selectedOrder && (
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">İstem Detayı</Typography>
                <Box>
                  <Chip
                    label={SAMPLE_STATUS_LABELS[selectedOrder.sampleStatus]}
                    color={SAMPLE_STATUS_COLORS[selectedOrder.sampleStatus]}
                    sx={{ mr: 1 }}
                  />
                  {selectedOrder.barcode && (
                    <Chip label={`Barkod: ${selectedOrder.barcode}`} variant="outlined" />
                  )}
                </Box>
              </Box>

              {/* Hasta Bilgileri */}
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Hasta Bilgileri
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {selectedOrder.patient.firstName} {selectedOrder.patient.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Doğum: {new Date(selectedOrder.patient.birthDate).toLocaleDateString('tr-TR')}
                  </Typography>
                </CardContent>
              </Card>

              {/* Testler */}
              <Typography variant="subtitle1" gutterBottom>
                Testler ve Parametreler
              </Typography>
              <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                {selectedOrder.tests.map((orderTest) => (
                  <Card key={orderTest.id} variant="outlined" sx={{ mb: 1 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {orderTest.test.name} ({orderTest.test.code})
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {orderTest.test.sampleType}
                          </Typography>
                        </Box>
                        {orderTest.barcode && (
                          <Chip
                            label={`Barkod: ${orderTest.barcode}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                      {orderTest.parameters && orderTest.parameters.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Parametreler:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {orderTest.parameters.map((param) => (
                              <Chip
                                key={param.id}
                                label={param.testParameter.name}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>

              {/* İşlem Butonları */}
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                {selectedOrder.sampleStatus === 'PENDING' && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => handleAcceptSample(selectedOrder.id)}
                  >
                    Numuneyi Kabul Et
                  </Button>
                )}
                {selectedOrder.sampleStatus === 'ACCEPTED' && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleStatusChange(selectedOrder.id, 'IN_PROGRESS')}
                  >
                    İşleme Al
                  </Button>
                )}
                {selectedOrder.sampleStatus === 'IN_PROGRESS' && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate(`/results/${selectedOrder.id}`)}
                  >
                    Sonuç Gir
                  </Button>
                )}
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/results/${selectedOrder.id}/preview`)}
                >
                  Sonuç Önizle
                </Button>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}

