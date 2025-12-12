import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Chip,
  IconButton,
  Alert,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import RetryIcon from '@mui/icons-material/Replay';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const QUEUE_STATUS_COLORS = {
  PENDING: 'default',
  PROCESSING: 'info',
  PROCESSED: 'success',
  ERROR: 'error',
  MANUAL_REVIEW: 'warning',
};

const QUEUE_STATUS_LABELS = {
  PENDING: 'Beklemede',
  PROCESSING: 'İşleniyor',
  PROCESSED: 'İşlendi',
  ERROR: 'Hata',
  MANUAL_REVIEW: 'Manuel İnceleme',
};

export default function DeviceQueue() {
  const [queueItems, setQueueItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchQueue();
    // Her 5 saniyede bir yenile
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = async () => {
    try {
      const response = await api.get('/devices/queue/all');
      setQueueItems(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Kuyruk yüklenemedi:', error);
      setLoading(false);
    }
  };

  const handleRetry = async (queueId) => {
    try {
      await api.post(`/devices/queue/${queueId}/retry`);
      alert('İşleme yeniden başlatıldı');
      fetchQueue();
    } catch (error) {
      console.error('Yeniden deneme başarısız:', error);
      alert('Hata: ' + (error.response?.data?.message || 'Bilinmeyen hata'));
    }
  };

  if (loading) {
    return <Container>Yükleniyor...</Container>;
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Cihaz Sonuç Kuyruğu</Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchQueue}
        >
          Yenile
        </Button>
      </Box>

      {queueItems.length === 0 ? (
        <Alert severity="info">Kuyrukta bekleyen sonuç yok.</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Cihaz</TableCell>
                <TableCell>Barkod</TableCell>
                <TableCell>Test Kodu</TableCell>
                <TableCell>Sonuç</TableCell>
                <TableCell>Hasta</TableCell>
                <TableCell>İstem</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>Tarih</TableCell>
                <TableCell align="right">İşlem</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {queueItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {item.device?.name || '-'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.device?.model || ''}
                    </Typography>
                  </TableCell>
                  <TableCell>{item.barcode || '-'}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {item.testCode || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {item.result || '-'} {item.unit ? `(${item.unit})` : ''}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {item.patient
                      ? `${item.patient.firstName} ${item.patient.lastName}`
                      : '-'}
                  </TableCell>
                  <TableCell>{item.orderId || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={QUEUE_STATUS_LABELS[item.status]}
                      size="small"
                      color={QUEUE_STATUS_COLORS[item.status]}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(item.createdAt).toLocaleString('tr-TR')}
                  </TableCell>
                  <TableCell align="right">
                    {item.status === 'ERROR' && (
                      <IconButton
                        size="small"
                        onClick={() => handleRetry(item.id)}
                        color="primary"
                        title="Yeniden Dene"
                      >
                        <RetryIcon />
                      </IconButton>
                    )}
                    {item.errorMessage && (
                      <Typography variant="caption" color="error" display="block">
                        {item.errorMessage}
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}

