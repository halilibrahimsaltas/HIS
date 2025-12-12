import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Paper,
  Box,
  Grid,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
  Divider,
  Alert,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const RESULT_STATUS_COLORS = {
  PENDING: 'default',
  ENTERED: 'info',
  VERIFIED: 'success',
  REJECTED: 'error',
};

const RESULT_STATUS_LABELS = {
  PENDING: 'Beklemede',
  ENTERED: 'Girildi',
  VERIFIED: 'Doğrulandı',
  REJECTED: 'Reddedildi',
};

export default function Results() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [results, setResults] = useState({}); // { parameterId: result }
  const [loading, setLoading] = useState(true);
  const [referenceRanges, setReferenceRanges] = useState({}); // { parameterId: range }

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const fetchReferenceRange = async (parameterId, age, gender) => {
    try {
      const response = await api.get(`/test-parameters/${parameterId}/reference-range?age=${age}&gender=${gender}`);
      if (response.data) {
        setReferenceRanges((prev) => ({
          ...prev,
          [parameterId]: response.data,
        }));
      }
    } catch (error) {
      // Referans aralığı bulunamazsa sessizce devam et
    }
  };

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/results/order/${orderId}`);
      setOrder(response.data);
      
      // Mevcut sonuçları yükle
      const initialResults = {};
      response.data.tests.forEach((orderTest) => {
        orderTest.parameters.forEach((param) => {
          if (param.result) {
            initialResults[param.id] = param.result;
          }
        });
      });
      setResults(initialResults);

      // Referans aralıklarını yükle
      if (response.data.patient) {
        const age = calculateAge(response.data.patient.birthDate);
        const gender = response.data.patient.gender;
        response.data.tests.forEach((orderTest) => {
          orderTest.parameters.forEach((param) => {
            fetchReferenceRange(param.testParameterId, age, gender);
          });
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Test istemi yüklenemedi:', error);
      alert('Test istemi bulunamadı');
      navigate('/sample-acceptance');
    }
  };

  const handleResultChange = (parameterId, value) => {
    setResults((prev) => ({
      ...prev,
      [parameterId]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const resultsArray = Object.entries(results)
        .filter(([_, value]) => value && value.trim())
        .map(([parameterId, result]) => ({
          orderTestParameterId: parseInt(parameterId),
          result: result.trim(),
          status: 'ENTERED',
        }));

      await api.post(`/results/order/${orderId}`, { results: resultsArray });
      alert('Sonuçlar başarıyla kaydedildi');
      fetchOrder();
    } catch (error) {
      console.error('Sonuçlar kaydedilemedi:', error);
      alert('Hata: ' + (error.response?.data?.message || 'Bilinmeyen hata'));
    }
  };

  const handleVerify = async (parameterId) => {
    try {
      await api.patch(`/results/parameter/${parameterId}/verify`);
      alert('Sonuç doğrulandı');
      fetchOrder();
    } catch (error) {
      console.error('Sonuç doğrulanamadı:', error);
      alert('Hata: ' + (error.response?.data?.message || 'Bilinmeyen hata'));
    }
  };

  if (loading) {
    return <Container>Yükleniyor...</Container>;
  }

  if (!order) {
    return <Container>Test istemi bulunamadı</Container>;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Sonuç Girişi</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={() => navigate('/sample-acceptance')}
            sx={{ mr: 1 }}
          >
            İptal
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
          >
            Kaydet
          </Button>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {/* Sol Panel - Hasta ve İstem Bilgileri */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              Hasta Bilgileri
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Hasta No
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {order.patient.id}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Ad Soyad
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {order.patient.firstName} {order.patient.lastName}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Doğum Tarihi
              </Typography>
              <Typography variant="body1">
                {new Date(order.patient.birthDate).toLocaleDateString('tr-TR')}
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                İstem No
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {order.id}
              </Typography>
            </Box>
            {order.barcode && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Barkod
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {order.barcode}
                </Typography>
              </Box>
            )}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Durum
              </Typography>
              <Chip
                label={order.sampleStatus}
                size="small"
                color={order.sampleStatus === 'ACCEPTED' ? 'success' : 'default'}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Sağ Panel - Sonuç Girişi */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 2 }}>
            {order.tests.map((orderTest) => (
              <Box key={orderTest.id} sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {orderTest.test.name} ({orderTest.test.code})
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {orderTest.test.sampleType}
                </Typography>
                <Divider sx={{ my: 2 }} />

                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Parametre</TableCell>
                        <TableCell>Birim</TableCell>
                        <TableCell>Referans Aralık</TableCell>
                        <TableCell>Sonuç</TableCell>
                        <TableCell>Durum</TableCell>
                        <TableCell align="right">İşlem</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orderTest.parameters.map((param) => (
                        <TableRow key={param.id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {param.testParameter.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {param.testParameter.code}
                            </Typography>
                          </TableCell>
                          <TableCell>{param.testParameter.unit || '-'}</TableCell>
                          <TableCell>
                            <Typography variant="caption">
                              {(() => {
                                const refRange = referenceRanges[param.testParameterId];
                                if (!refRange) {
                                  return param.testParameter.referenceRange || '-';
                                }
                                if (refRange.rangeText) {
                                  return refRange.rangeText;
                                }
                                if (refRange.minValue !== null && refRange.minValue !== undefined && 
                                    refRange.maxValue !== null && refRange.maxValue !== undefined) {
                                  return `${refRange.minValue} - ${refRange.maxValue}`;
                                }
                                if (refRange.minValue !== null && refRange.minValue !== undefined) {
                                  return `> ${refRange.minValue}`;
                                }
                                if (refRange.maxValue !== null && refRange.maxValue !== undefined) {
                                  return `< ${refRange.maxValue}`;
                                }
                                return param.testParameter.referenceRange || '-';
                              })()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              value={results[param.id] || param.result || ''}
                              onChange={(e) => handleResultChange(param.id, e.target.value)}
                              placeholder="Sonuç giriniz"
                              sx={{ minWidth: 150 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={RESULT_STATUS_LABELS[param.status]}
                              size="small"
                              color={RESULT_STATUS_COLORS[param.status]}
                            />
                          </TableCell>
                          <TableCell align="right">
                            {param.status === 'ENTERED' && (
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<CheckCircleIcon />}
                                onClick={() => handleVerify(param.id)}
                              >
                                Doğrula
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ))}

            {order.tests.length === 0 && (
              <Alert severity="info">Bu istemde test bulunmamaktadır.</Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

