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
  FormHelperText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ScienceIcon from '@mui/icons-material/Science';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Patients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    fatherName: '',
    birthDate: '',
    phone: '',
    email: '',
    address: '',
    gender: '',
    identityNumber: '',
    passportNumber: '',
  });
  const [errors, setErrors] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients');
      setPatients(response.data);
    } catch (error) {
      console.error('Hastalar yüklenemedi:', error);
    }
  };

  const handleOpen = (patient = null) => {
    if (patient) {
      setEditing(patient);
      setFormData({
        firstName: patient.firstName,
        lastName: patient.lastName,
        fatherName: patient.fatherName || '',
        birthDate: patient.birthDate ? new Date(patient.birthDate).toISOString().split('T')[0] : '',
        phone: patient.phone || '',
        email: patient.email || '',
        address: patient.address || '',
        gender: patient.gender || '',
        identityNumber: patient.identityNumber || '',
        passportNumber: patient.passportNumber || '',
      });
    } else {
      setEditing(null);
      setFormData({
        firstName: '',
        lastName: '',
        fatherName: '',
        birthDate: '',
        phone: '',
        email: '',
        address: '',
        gender: '',
        identityNumber: '',
        passportNumber: '',
      });
    }
    setErrors({});
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    setFormData({
      firstName: '',
      lastName: '',
      fatherName: '',
      birthDate: '',
      phone: '',
      email: '',
      address: '',
      gender: '',
      identityNumber: '',
      passportNumber: '',
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Ad alanı zorunludur';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Soyad alanı zorunludur';
    }
    if (!formData.fatherName.trim()) {
      newErrors.fatherName = 'Baba adı zorunludur';
    }
    if (!formData.birthDate) {
      newErrors.birthDate = 'Doğum tarihi zorunludur';
    }
    if (!formData.gender) {
      newErrors.gender = 'Cinsiyet zorunludur';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const submitData = {
        ...formData,
        birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : null,
        email: formData.email && formData.email.trim() ? formData.email.trim() : undefined,
        phone: formData.phone && formData.phone.trim() ? formData.phone.trim() : undefined,
        address: formData.address && formData.address.trim() ? formData.address.trim() : undefined,
        identityNumber: formData.identityNumber && formData.identityNumber.trim() ? formData.identityNumber.trim() : undefined,
        passportNumber: formData.passportNumber && formData.passportNumber.trim() ? formData.passportNumber.trim() : undefined,
      };
      
      if (editing) {
        await api.patch(`/patients/${editing.id}`, submitData);
      } else {
        await api.post('/patients', submitData);
      }
      fetchPatients();
      handleClose();
    } catch (error) {
      console.error('Hasta kaydedilemedi:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.message?.[0] || 'Bilinmeyen hata';
      alert('Hata: ' + errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu hastayı silmek istediğinize emin misiniz?')) {
      return;
    }
    try {
      await api.delete(`/patients/${id}`);
      fetchPatients();
    } catch (error) {
      console.error('Hasta silinemedi:', error);
      alert('Hata: ' + (error.response?.data?.message || 'Bilinmeyen hata'));
    }
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Hastalar</Typography>
        <Box>
          {(user?.role === 'ADMIN' || user?.role === 'RECEPTION') && (
            <>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpen()}
                sx={{ mr: 1 }}
              >
                Yeni Hasta
              </Button>
              <Button
                variant="outlined"
                startIcon={<ScienceIcon />}
                onClick={() => navigate('/orders')}
              >
                Test İstemleri
              </Button>
            </>
          )}
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ad</TableCell>
              <TableCell>Soyad</TableCell>
              <TableCell>Doğum Tarihi</TableCell>
              <TableCell>Telefon</TableCell>
              <TableCell>E-posta</TableCell>
              <TableCell>Kayıt Tarihi</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell>{patient.firstName}</TableCell>
                <TableCell>{patient.lastName}</TableCell>
                <TableCell>
                  {patient.birthDate
                    ? new Date(patient.birthDate).toLocaleDateString('tr-TR')
                    : '-'}
                </TableCell>
                <TableCell>{patient.phone || '-'}</TableCell>
                <TableCell>{patient.email || '-'}</TableCell>
                <TableCell>
                  {new Date(patient.createdAt).toLocaleDateString('tr-TR')}
                </TableCell>
                <TableCell align="right">
                  {(user?.role === 'ADMIN' || user?.role === 'RECEPTION') && (
                    <>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/patients/${patient.id}/test-selection`)}
                        color="primary"
                        title="Test Seç"
                      >
                        <ScienceIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpen(patient)}
                        color="primary"
                        title="Düzenle"
                      >
                        <EditIcon />
                      </IconButton>
                      {user?.role === 'ADMIN' && (
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(patient.id)}
                          color="error"
                          title="Sil"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Hasta Düzenle' : 'Yeni Hasta'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Ad *"
                fullWidth
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                error={!!errors.firstName}
                helperText={errors.firstName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Soyad *"
                fullWidth
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                error={!!errors.lastName}
                helperText={errors.lastName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Baba Adı *"
                fullWidth
                required
                value={formData.fatherName}
                onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                error={!!errors.fatherName}
                helperText={errors.fatherName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Doğum Tarihi *"
                type="date"
                fullWidth
                required
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                InputLabelProps={{
                  shrink: true,
                }}
                error={!!errors.birthDate}
                helperText={errors.birthDate}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense" required error={!!errors.gender}>
                <InputLabel>Cinsiyet *</InputLabel>
                <Select
                  value={formData.gender}
                  label="Cinsiyet *"
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <MenuItem value="">Seçiniz</MenuItem>
                  <MenuItem value="MALE">Erkek</MenuItem>
                  <MenuItem value="FEMALE">Kadın</MenuItem>
                </Select>
                {errors.gender && <FormHelperText error>{errors.gender}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Kimlik No"
                fullWidth
                value={formData.identityNumber}
                onChange={(e) => setFormData({ ...formData, identityNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Pasaport No"
                fullWidth
                value={formData.passportNumber}
                onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Telefon"
                fullWidth
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="E-posta (Opsiyonel)"
                type="email"
                fullWidth
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                helperText="E-posta adresi opsiyoneldir"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Adres"
                fullWidth
                multiline
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
    </Container>
  );
}

