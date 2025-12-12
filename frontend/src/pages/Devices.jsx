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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SettingsIcon from '@mui/icons-material/Settings';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const PROTOCOLS = [
  { value: 'ASTM', label: 'ASTM' },
  { value: 'HL7', label: 'HL7' },
  { value: 'CUSTOM', label: 'Özel' },
];

const CONNECTION_TYPES = [
  { value: 'TCP_IP', label: 'TCP/IP' },
  { value: 'SERIAL', label: 'Seri Port' },
  { value: 'FILE', label: 'Dosya' },
];

export default function Devices() {
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [open, setOpen] = useState(false);
  const [mappingDialogOpen, setMappingDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [testParameters, setTestParameters] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    manufacturer: '',
    model: '',
    serialNumber: '',
    protocol: 'ASTM',
    connectionType: 'TCP_IP',
    host: '',
    port: '',
    serialPort: '',
    baudRate: '9600',
    isActive: false,
  });
  const [mappingFormData, setMappingFormData] = useState({
    deviceTestCode: '',
    testParameterId: '',
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchDevices();
    fetchTestParameters();
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await api.get('/devices');
      setDevices(response.data);
    } catch (error) {
      console.error('Cihazlar yüklenemedi:', error);
    }
  };

  const fetchTestParameters = async () => {
    try {
      const response = await api.get('/test-parameters');
      setTestParameters(response.data);
    } catch (error) {
      console.error('Parametreler yüklenemedi:', error);
    }
  };

  const handleOpen = (device = null) => {
    if (device) {
      setEditing(device);
      setFormData({
        name: device.name,
        manufacturer: device.manufacturer,
        model: device.model,
        serialNumber: device.serialNumber || '',
        protocol: device.protocol,
        connectionType: device.connectionType,
        host: device.host || '',
        port: device.port?.toString() || '',
        serialPort: device.serialPort || '',
        baudRate: device.baudRate?.toString() || '9600',
        isActive: device.isActive || false,
      });
    } else {
      setEditing(null);
      setFormData({
        name: '',
        manufacturer: '',
        model: '',
        serialNumber: '',
        protocol: 'ASTM',
        connectionType: 'TCP_IP',
        host: '',
        port: '',
        serialPort: '',
        baudRate: '9600',
        isActive: false,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
  };

  const handleOpenMappingDialog = (device) => {
    setSelectedDevice(device);
    setMappingFormData({
      deviceTestCode: '',
      testParameterId: '',
    });
    setMappingDialogOpen(true);
  };

  const handleCloseMappingDialog = () => {
    setMappingDialogOpen(false);
    setSelectedDevice(null);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.manufacturer.trim() || !formData.model.trim()) {
      alert('Ad, Üretici ve Model alanları zorunludur');
      return;
    }

    if (formData.connectionType === 'TCP_IP' && (!formData.host || !formData.port)) {
      alert('TCP/IP için Host ve Port gerekli');
      return;
    }

    if (formData.connectionType === 'SERIAL' && !formData.serialPort) {
      alert('Seri Port için Port adı gerekli');
      return;
    }

    try {
      const data = {
        ...formData,
        port: formData.port ? parseInt(formData.port) : undefined,
        baudRate: formData.baudRate ? parseInt(formData.baudRate) : undefined,
        serialNumber: formData.serialNumber.trim() || undefined,
        host: formData.host.trim() || undefined,
        serialPort: formData.serialPort.trim() || undefined,
      };

      if (editing) {
        await api.patch(`/devices/${editing.id}`, data);
      } else {
        await api.post('/devices', data);
      }
      fetchDevices();
      handleClose();
    } catch (error) {
      console.error('Cihaz kaydedilemedi:', error);
      alert('Hata: ' + (error.response?.data?.message || 'Bilinmeyen hata'));
    }
  };

  const handleSubmitMapping = async () => {
    if (!mappingFormData.deviceTestCode.trim() || !mappingFormData.testParameterId) {
      alert('Cihaz test kodu ve parametre seçimi zorunludur');
      return;
    }

    try {
      await api.post(`/devices/${selectedDevice.id}/mappings`, {
        deviceTestCode: mappingFormData.deviceTestCode.trim(),
        testParameterId: parseInt(mappingFormData.testParameterId),
      });
      fetchDevices();
      handleCloseMappingDialog();
    } catch (error) {
      console.error('Eşleştirme kaydedilemedi:', error);
      alert('Hata: ' + (error.response?.data?.message || 'Bilinmeyen hata'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu cihazı silmek istediğinize emin misiniz?')) {
      return;
    }
    try {
      await api.delete(`/devices/${id}`);
      fetchDevices();
    } catch (error) {
      console.error('Cihaz silinemedi:', error);
      alert('Hata: ' + (error.response?.data?.message || 'Bilinmeyen hata'));
    }
  };

  const handleDeleteMapping = async (mappingId) => {
    if (!window.confirm('Bu eşleştirmeyi silmek istediğinize emin misiniz?')) {
      return;
    }
    try {
      await api.delete(`/devices/mappings/${mappingId}`);
      fetchDevices();
    } catch (error) {
      console.error('Eşleştirme silinemedi:', error);
      alert('Hata: ' + (error.response?.data?.message || 'Bilinmeyen hata'));
    }
  };

  const handleToggleActive = async (device) => {
    try {
      await api.patch(`/devices/${device.id}`, {
        isActive: !device.isActive,
      });
      fetchDevices();
    } catch (error) {
      console.error('Cihaz durumu güncellenemedi:', error);
      alert('Hata: ' + (error.response?.data?.message || 'Bilinmeyen hata'));
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Cihaz Yönetimi</Typography>
        {user?.role === 'ADMIN' && (
          <Box>
            <Button
              variant="outlined"
              startIcon={<SettingsIcon />}
              onClick={() => navigate('/devices/queue')}
              sx={{ mr: 1 }}
            >
              Sonuç Kuyruğu
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpen()}
            >
              Yeni Cihaz
            </Button>
          </Box>
        )}
      </Box>

      {devices.map((device) => (
        <Accordion key={device.id} sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {device.name} ({device.manufacturer} {device.model})
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                  <Chip
                    label={PROTOCOLS.find((p) => p.value === device.protocol)?.label || device.protocol}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={CONNECTION_TYPES.find((c) => c.value === device.connectionType)?.label || device.connectionType}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={device.isActive ? 'Aktif' : 'Pasif'}
                    size="small"
                    color={device.isActive ? 'success' : 'default'}
                  />
                  {device._count?.results > 0 && (
                    <Chip
                      label={`${device._count.results} bekleyen`}
                      size="small"
                      color="warning"
                    />
                  )}
                </Box>
              </Box>
              {user?.role === 'ADMIN' && (
                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={device.isActive}
                        onChange={() => handleToggleActive(device)}
                        size="small"
                      />
                    }
                    label="Aktif"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpen(device);
                    }}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(device.id);
                    }}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Test Kodu Eşleştirmeleri
                </Typography>
                {user?.role === 'ADMIN' && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenMappingDialog(device)}
                  >
                    Yeni Eşleştirme
                  </Button>
                )}
              </Box>

              {device.mappings && device.mappings.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Cihaz Test Kodu</TableCell>
                        <TableCell>LIMS Parametresi</TableCell>
                        <TableCell>Birim</TableCell>
                        {user?.role === 'ADMIN' && <TableCell align="right">İşlem</TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {device.mappings.map((mapping) => (
                        <TableRow key={mapping.id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {mapping.deviceTestCode}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {mapping.testParameter.name} ({mapping.testParameter.code})
                          </TableCell>
                          <TableCell>{mapping.testParameter.unit || '-'}</TableCell>
                          {user?.role === 'ADMIN' && (
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteMapping(mapping.id)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                  Henüz test kodu eşleştirmesi tanımlanmamış.
                </Typography>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Cihaz Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Cihaz Düzenle' : 'Yeni Cihaz'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Cihaz Adı *"
                fullWidth
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Seri No"
                fullWidth
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Üretici *"
                fullWidth
                required
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                placeholder="Roche, Siemens, vb."
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Model *"
                fullWidth
                required
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="Cobas 6000, Cobas 8000, vb."
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense" required>
                <InputLabel>Protokol *</InputLabel>
                <Select
                  value={formData.protocol}
                  label="Protokol *"
                  onChange={(e) => setFormData({ ...formData, protocol: e.target.value })}
                >
                  {PROTOCOLS.map((p) => (
                    <MenuItem key={p.value} value={p.value}>
                      {p.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense" required>
                <InputLabel>Bağlantı Tipi *</InputLabel>
                <Select
                  value={formData.connectionType}
                  label="Bağlantı Tipi *"
                  onChange={(e) => setFormData({ ...formData, connectionType: e.target.value })}
                >
                  {CONNECTION_TYPES.map((c) => (
                    <MenuItem key={c.value} value={c.value}>
                      {c.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {formData.connectionType === 'TCP_IP' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    margin="dense"
                    label="Host/IP *"
                    fullWidth
                    required
                    value={formData.host}
                    onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                    placeholder="192.168.1.100"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    margin="dense"
                    label="Port *"
                    fullWidth
                    required
                    type="number"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                    placeholder="5000"
                  />
                </Grid>
              </>
            )}

            {formData.connectionType === 'SERIAL' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    margin="dense"
                    label="Seri Port *"
                    fullWidth
                    required
                    value={formData.serialPort}
                    onChange={(e) => setFormData({ ...formData, serialPort: e.target.value })}
                    placeholder="COM1, /dev/ttyUSB0"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    margin="dense"
                    label="Baud Rate"
                    fullWidth
                    type="number"
                    value={formData.baudRate}
                    onChange={(e) => setFormData({ ...formData, baudRate: e.target.value })}
                    placeholder="9600"
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                }
                label="Aktif (Bağlantıyı başlat)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained">
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Eşleştirme Dialog */}
      <Dialog open={mappingDialogOpen} onClose={handleCloseMappingDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Yeni Test Kodu Eşleştirmesi
          {selectedDevice && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Cihaz: {selectedDevice.name}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Cihaz Test Kodu *"
                fullWidth
                required
                value={mappingFormData.deviceTestCode}
                onChange={(e) => setMappingFormData({ ...mappingFormData, deviceTestCode: e.target.value.toUpperCase() })}
                helperText="Cihazın gönderdiği test kodu (örn: GLU, HGB)"
                placeholder="GLU"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="dense" required>
                <InputLabel>LIMS Parametresi *</InputLabel>
                <Select
                  value={mappingFormData.testParameterId}
                  label="LIMS Parametresi *"
                  onChange={(e) => setMappingFormData({ ...mappingFormData, testParameterId: e.target.value })}
                >
                  {testParameters.map((param) => (
                    <MenuItem key={param.id} value={param.id}>
                      {param.name} ({param.code}) - {param.unit || 'Birim yok'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMappingDialog}>İptal</Button>
          <Button onClick={handleSubmitMapping} variant="contained">
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

