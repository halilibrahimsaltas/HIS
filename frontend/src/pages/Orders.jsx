import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Test istemleri yüklenemedi:', error);
    }
  };

  const handleEdit = (order) => {
    navigate(`/patients/${order.patientId}/test-selection?orderId=${order.id}`);
  };

  const handleNewOrder = () => {
    navigate('/patients');
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Test İstemleri</Typography>
        {(user?.role === 'ADMIN' || user?.role === 'RECEPTION') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNewOrder}
          >
            Yeni Test İstemi
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Hasta</TableCell>
              <TableCell>Testler</TableCell>
              <TableCell>Toplam</TableCell>
              <TableCell>Tarih</TableCell>
              <TableCell>Oluşturan</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>
                  {order.patient.firstName} {order.patient.lastName}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {order.tests.map((ot) => (
                      <Box key={ot.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Chip
                          label={`${ot.test.name} (${ot.parameters?.length || 0} param)`}
                          size="small"
                          variant="outlined"
                        />
                        {ot.barcode && (
                          <Chip
                            label={`Barkod: ${ot.barcode}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    ))}
                  </Box>
                </TableCell>
                <TableCell>{order.total.toFixed(2)} ₺</TableCell>
                <TableCell>
                  {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                </TableCell>
                <TableCell>
                  {order.createdByUser ? (
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {order.createdByUser.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.createdByUser.role === 'ADMIN' ? 'Admin' :
                         order.createdByUser.role === 'RECEPTION' ? 'Kasiyer/Resepsiyon' :
                         order.createdByUser.role === 'LAB' ? 'Laborant' :
                         order.createdByUser.role === 'CHIEF_PHYSICIAN' ? 'Baş Hekim' :
                         order.createdByUser.role}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      -
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 0.5, 
                    justifyContent: 'flex-end', 
                    flexWrap: 'nowrap',
                    alignItems: 'center',
                  }}>
                    {/* Barkod yazdırma butonu - sadece barkod varsa göster */}
                    {order.tests.some((ot) => ot.barcode) && (
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/orders/${order.id}/barcodes`)}
                        title="Barkod Yazdır"
                        sx={{ 
                          border: '1px solid',
                          borderColor: 'primary.main',
                          '&:hover': {
                            backgroundColor: 'primary.light',
                            color: 'white',
                          }
                        }}
                      >
                        <PrintIcon fontSize="small" />
                      </IconButton>
                    )}
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => navigate(`/results/${order.id}/preview`)}
                      sx={{ 
                        minWidth: 'auto',
                        px: 1,
                        fontSize: '0.75rem',
                        py: 0.5,
                      }}
                    >
                      Rapor
                    </Button>
                    {(user?.role === 'ADMIN' || user?.role === 'RECEPTION') && (
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(order)}
                        color="primary"
                        title="Düzenle"
                        sx={{ 
                          border: '1px solid',
                          borderColor: 'primary.main',
                          '&:hover': {
                            backgroundColor: 'primary.light',
                            color: 'white',
                          }
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    {(user?.role === 'ADMIN' || user?.role === 'LAB') && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(`/results/${order.id}`)}
                        sx={{ 
                          minWidth: 'auto',
                          px: 1,
                          fontSize: '0.75rem',
                          py: 0.5,
                        }}
                      >
                        Sonuç
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
