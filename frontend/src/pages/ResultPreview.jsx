import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Paper,
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
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

export default function ResultPreview() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
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
      navigate('/orders');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const isResultComplete = () => {
    if (!order) return false;
    let totalParams = 0;
    let enteredParams = 0;

    order.tests.forEach((orderTest) => {
      orderTest.parameters.forEach((param) => {
        totalParams++;
        if (param.result && param.status !== 'PENDING') {
          enteredParams++;
        }
      });
    });

    return totalParams > 0 && enteredParams === totalParams;
  };

  if (loading) {
    return <Container>Yükleniyor...</Container>;
  }

  if (!order) {
    return <Container>Test istemi bulunamadı</Container>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/orders')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">Sonuç Raporu</Typography>
        </Box>
        <Box>
          {(user?.role === 'ADMIN' || user?.role === 'LAB') && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/results/${orderId}`)}
              sx={{ mr: 1 }}
            >
              Düzenle
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            Yazdır
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3 }} id="printable-content">
        {/* Başlık */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            LABORATUVAR SONUÇ RAPORU
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Rapor Tarihi: {new Date().toLocaleDateString('tr-TR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Hasta Bilgileri */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Hasta Bilgileri
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Hasta No
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {order.patient.id}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Ad Soyad
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {order.patient.firstName} {order.patient.lastName}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Doğum Tarihi
                </Typography>
                <Typography variant="body1">
                  {new Date(order.patient.birthDate).toLocaleDateString('tr-TR')}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Cinsiyet
                </Typography>
                <Typography variant="body1">
                  {order.patient.gender === 'MALE' ? 'Erkek' : order.patient.gender === 'FEMALE' ? 'Kadın' : '-'}
                </Typography>
              </Grid>
              {order.barcode && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Barkod
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {order.barcode}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  İstem No
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {order.id}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Test Sonuçları */}
        {order.tests.map((orderTest) => (
          <Box key={orderTest.id} sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              {orderTest.test.name} ({orderTest.test.code})
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Numune Tipi: {orderTest.test.sampleType}
            </Typography>
            <Divider sx={{ my: 2 }} />

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Parametre</TableCell>
                    <TableCell>Sonuç</TableCell>
                    <TableCell>Birim</TableCell>
                    <TableCell>Referans Aralık</TableCell>
                    <TableCell>Durum</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orderTest.parameters.map((param) => {
                    const hasResult = param.result && param.result.trim();
                    const refRangeObj = referenceRanges[param.testParameterId];
                    let refRange = null;
                    if (!refRangeObj) {
                      refRange = param.testParameter.referenceRange;
                    } else if (refRangeObj.rangeText) {
                      refRange = refRangeObj.rangeText;
                    } else if (refRangeObj.minValue !== null && refRangeObj.minValue !== undefined && 
                               refRangeObj.maxValue !== null && refRangeObj.maxValue !== undefined) {
                      refRange = `${refRangeObj.minValue}-${refRangeObj.maxValue}`;
                    } else if (refRangeObj.minValue !== null && refRangeObj.minValue !== undefined) {
                      refRange = `>${refRangeObj.minValue}`;
                    } else if (refRangeObj.maxValue !== null && refRangeObj.maxValue !== undefined) {
                      refRange = `<${refRangeObj.maxValue}`;
                    } else {
                      refRange = param.testParameter.referenceRange;
                    }
                    const isNormal = hasResult && refRange
                      ? checkIfNormal(param.result, refRange)
                      : null;

                    return (
                      <TableRow key={param.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {param.testParameter.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {param.testParameter.code}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body1"
                            fontWeight="bold"
                            color={isNormal === false ? 'error' : 'inherit'}
                          >
                            {hasResult ? param.result : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>{param.testParameter.unit || '-'}</TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {refRange || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={RESULT_STATUS_LABELS[param.status]}
                            size="small"
                            color={RESULT_STATUS_COLORS[param.status]}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))}

        {/* Alt Bilgi */}
        <Divider sx={{ my: 3 }} />
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Bu rapor elektronik ortamda oluşturulmuştur.
          </Typography>
          {order.acceptedByUser && (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              Numune Kabul: {order.acceptedByUser.name} -{' '}
              {order.acceptedAt
                ? new Date(order.acceptedAt).toLocaleDateString('tr-TR')
                : '-'}
            </Typography>
          )}
        </Box>
      </Paper>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-content, #printable-content * {
            visibility: visible;
          }
          #printable-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </Container>
  );
}

// Basit referans aralığı kontrolü
function checkIfNormal(result, referenceRange) {
  if (!result || !referenceRange) return null;
  
  const numResult = parseFloat(result);
  if (isNaN(numResult)) return null;

  // Basit aralık kontrolü (örn: "70-100", "<200", ">40")
  if (referenceRange.includes('-')) {
    const [min, max] = referenceRange.split('-').map(Number);
    return numResult >= min && numResult <= max;
  } else if (referenceRange.startsWith('<')) {
    const max = parseFloat(referenceRange.substring(1));
    return numResult < max;
  } else if (referenceRange.startsWith('>')) {
    const min = parseFloat(referenceRange.substring(1));
    return numResult > min;
  }

  return null;
}

