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
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {order.tests.map((ot) => (
                      <Chip
                        key={ot.id}
                        label={`${ot.test.name} (${ot.parameters?.length || 0} param)`}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>{order.total.toFixed(2)} ₺</TableCell>
                <TableCell>
                  {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                </TableCell>
                <TableCell align="right">
                  {(user?.role === 'ADMIN' || user?.role === 'RECEPTION') && (
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(order)}
                      color="primary"
                      title="Düzenle"
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
