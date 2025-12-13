import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

export default function BarcodeLabel({ 
  barcode, 
  testName, 
  patientName, 
  patientId,
  birthDate,
  gender,
  orderId, 
  sampleType,
  acceptedAt,
  createdAt,
  onPrint 
}) {
  const barcodeRef = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    if (barcodeRef.current && barcode) {
      try {
        // Barkod boyutunu 102mm x 76mm formatına sığacak şekilde ayarla
        // Sadece ID kullanıldığı için çok daha kısa barkod olacak
        JsBarcode(barcodeRef.current, barcode, {
          format: 'CODE128',
          width: 3,
          height: 30,
          displayValue: false,
          fontSize: 12,
          textMargin: 2,
          margin: 2,
        });
      } catch (error) {
        console.error('Barkod oluşturma hatası:', error);
      }
    }
  }, [barcode]);

  // Tarih formatlama
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('tr-TR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const formatDateTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString('tr-TR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePrintSingle = () => {
    if (onPrint && labelRef.current) {
      onPrint(labelRef.current);
    }
  };

  if (!barcode) {
    return null;
  }

  return (
    <div
      ref={labelRef}
      style={{
        width: '102mm', // 4 inch
        height: '76mm', // 3 inch
        padding: '4mm',
        border: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: 'white',
        pageBreakAfter: 'always',
        pageBreakInside: 'avoid',
        margin: '0 auto',
        boxSizing: 'border-box',
        position: 'relative',
        fontFamily: 'Arial, sans-serif',
        overflow: 'hidden',
      }}
      className="barcode-label"
    >
      {/* Üst Kısım - Yazılar */}
      <div style={{ 
        width: '100%',
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        marginBottom: '3mm',
      }}>
        {/* Hasta Adı - Büyük ve Belirgin */}
        <div style={{ 
          fontSize: '16pt', 
          fontWeight: 'bold', 
          marginBottom: '3mm', 
          lineHeight: '1.2',
          color: '#000',
          textTransform: 'uppercase',
          textAlign: 'center',
        }}>
          {patientName || 'HASTA ADI'}
        </div>

        {/* Test Adı */}
        <div style={{ 
          fontSize: '12pt', 
          fontWeight: 'bold', 
          marginBottom: '2mm', 
          lineHeight: '1.3',
          color: '#000',
          textAlign: 'center',
        }}>
          {testName || 'Test'}
        </div>

        {/* Tarih */}
        {(acceptedAt || createdAt) && (
          <div style={{ 
            fontSize: '10pt', 
            color: '#333', 
            lineHeight: '1.2',
            textAlign: 'center',
          }}>
            {formatDate(acceptedAt || createdAt)}
          </div>
        )}
      </div>

      {/* Alt Kısım - Barkod */}
      <div style={{ 
        width: '100%',
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        flex: '1',
        marginTop: '2mm',
      }}>
        <svg 
          ref={barcodeRef} 
          style={{ 
            maxWidth: '90%', 
            maxHeight: '40mm',
            width: 'auto',
            height: 'auto',
            display: 'block',
          }} 
        />
        
        {/* Barkod Numarası - Barkodun altında */}
        <div style={{ 
          fontSize: '9pt', 
          color: '#000', 
          fontWeight: '600',
          fontFamily: 'monospace',
          letterSpacing: '0.5px',
          marginTop: '2mm',
          textAlign: 'center',
        }}>
          {barcode}
        </div>
      </div>

      {/* Yazdırma Butonu - Sadece Ekranda Görünür, Yazdırma Sırasında Tamamen Gizli */}
      {onPrint && (
        <button
          onClick={handlePrintSingle}
          className="no-print print-button"
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            padding: '6px 12px',
            fontSize: '10pt',
            backgroundColor: '#F57C00',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            zIndex: 10,
          }}
        >
          Yazdır
        </button>
      )}
    </div>
  );
}

