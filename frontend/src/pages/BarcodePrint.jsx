import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  IconButton,
  Card,
  CardContent,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BarcodeLabel from '../components/BarcodeLabel';
import api from '../api/axios';

export default function BarcodePrint() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const printWindowRef = useRef(null);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      setOrder(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Test istemi yüklenemedi:', error);
      alert('Test istemi bulunamadı');
      navigate('/orders');
    }
  };

  const handlePrintSingle = (labelElement) => {
    // Yeni bir pencere aç ve sadece bu etiketi yazdır
    const printWindow = window.open('', '_blank', 'width=800,height=600,left=100,top=100');
    if (!printWindow) {
      alert('Pop-up engelleyici nedeniyle yazdırma penceresi açılamadı. Lütfen pop-up engelleyiciyi kapatın.');
      return;
    }

    printWindowRef.current = printWindow;

    // Yazdırma butonunu kaldır
    const labelClone = labelElement.cloneNode(true);
    const printButton = labelClone.querySelector('.print-button, .no-print');
    if (printButton) {
      printButton.remove();
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Barkod Yazdır</title>
          <meta charset="UTF-8">
          <style>
            @page {
              size: 102mm 76mm;
              margin: 0;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              margin: 0;
              padding: 20px;
              width: 100%;
              min-height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
              background: #f5f5f5;
            }
            .print-container {
              width: 102mm;
              height: 76mm;
              background: white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .barcode-label {
              border: none !important;
            }
            .no-print,
            .print-button,
            button.no-print,
            button.print-button {
              display: none !important;
            }
            @media print {
              body {
                padding: 0;
                background: white;
              }
              .print-container {
                box-shadow: none;
                width: 102mm;
                height: 76mm;
              }
            }
            * {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${labelClone.outerHTML}
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // İçerik yüklendikten sonra yazdır
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        // Yazdırma işlemi tamamlandıktan sonra pencereyi kapat
        setTimeout(() => {
          printWindow.close();
        }, 500);
      }, 250);
    };
  };

  const handlePrintAll = () => {
    window.print();
  };

  if (loading) {
    return <Container>Yükleniyor...</Container>;
  }

  if (!order) {
    return <Container>Test istemi bulunamadı</Container>;
  }

  const patientName = `${order.patient.firstName} ${order.patient.lastName}`;
  const testsWithBarcode = order.tests.filter((ot) => ot.barcode);

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Yazdırma Kontrolleri - Sadece Ekranda Görünür */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          '@media print': {
            display: 'none',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/orders')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">Barkod Yazdırma (4x3 inch)</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={handlePrintAll}
        >
          Tümünü Yazdır
        </Button>
      </Box>

      {/* Etiketler - Ekranda Görüntüleme */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          '@media print': {
            display: 'none',
          },
        }}
      >
        {testsWithBarcode.map((orderTest) => (
          <Card key={orderTest.id} variant="outlined">
            <CardContent>
              <BarcodeLabel
                barcode={orderTest.barcode}
                testName={orderTest.test.name}
                patientName={patientName}
                patientId={order.patient.id}
                birthDate={order.patient.birthDate}
                gender={order.patient.gender}
                orderId={order.id}
                sampleType={orderTest.test.sampleType}
                acceptedAt={order.acceptedAt}
                createdAt={order.createdAt}
                onPrint={handlePrintSingle}
              />
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Yazdırma Alanı - Sadece Yazdırma Sırasında Görünür */}
      <Box
        sx={{
          display: 'none',
          '@media print': {
            display: 'block',
          },
        }}
      >
        {testsWithBarcode.map((orderTest) => (
          <BarcodeLabel
            key={orderTest.id}
            barcode={orderTest.barcode}
            testName={orderTest.test.name}
            patientName={patientName}
            patientId={order.patient.id}
            birthDate={order.patient.birthDate}
            gender={order.patient.gender}
            orderId={order.id}
            sampleType={orderTest.test.sampleType}
            acceptedAt={order.acceptedAt}
            createdAt={order.createdAt}
          />
        ))}
      </Box>

      {/* Yazdırma Stilleri */}
      <style>
        {`
          @media print {
            @page {
              size: 102mm 76mm;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              background: white;
            }
            * {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .no-print,
            .print-button,
            button.no-print,
            button.print-button {
              display: none !important;
            }
            .barcode-label {
              page-break-after: always;
              page-break-inside: avoid;
            }
            .barcode-label:last-child {
              page-break-after: auto;
            }
          }
        `}
      </style>
    </Container>
  );
}

