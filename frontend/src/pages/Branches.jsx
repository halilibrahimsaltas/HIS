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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Box,
  Grid,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Branches() {
  const [branches, setBranches] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    isActive: true,
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await api.get('/branches');
      setBranches(response.data);
    } catch (error) {
      console.error('Şubeler yüklenemedi:', error);
    }
  };

  const handleOpen = (branch = null) => {
    if (branch) {
      setEditing(branch);
      setFormData({
        name: branch.name,
        code: branch.code,
        address: branch.address || '',
        phone: branch.phone || '',
        email: branch.email || '',
        isActive: branch.isActive,
      });
    } else {
      setEditing(null);
      setFormData({
        name: '',
        code: '',
        address: '',
        phone: '',
        email: '',
        isActive: true,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    setFormData({
      name: '',
      code: '',
      address: '',
      phone: '',
      email: '',
      isActive: true,
    });
  };

  const handleSubmit = async () => {
    try {
      if (editing) {
        await api.patch(`/branches/${editing.id}`, formData);
        alert('Şube başarıyla güncellendi');
      } else {
        await api.post('/branches', formData);
        alert('Şube başarıyla oluşturuldu');
      }
      fetchBranches();
      handleClose();
    } catch (error) {
      console.error('Şube kaydedilemedi:', error);
      alert('Hata: ' + (error.response?.data?.message || 'Bilinmeyen hata'));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu şubeyi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await api.delete(`/branches/${id}`);
      alert('Şube başarıyla silindi');
      fetchBranches();
    } catch (error) {
      console.error('Şube silinemedi:', error);
      alert('Hata: ' + (error.response?.data?.message || 'Bilinmeyen hata'));
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <Container>
        <Typography variant="h4" sx={{ mt: 3 }}>
          Yetkiniz yok
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, mt: 3 }}>
        <Typography variant="h4">Şubeler</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Yeni Şube
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Kod</TableCell>
              <TableCell>Ad</TableCell>
              <TableCell>Adres</TableCell>
              <TableCell>Telefon</TableCell>
              <TableCell>E-posta</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>Kullanıcı Sayısı</TableCell>
              <TableCell>Sipariş Sayısı</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {branches.map((branch) => (
              <TableRow key={branch.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {branch.code}
                  </Typography>
                </TableCell>
                <TableCell>{branch.name}</TableCell>
                <TableCell>{branch.address || '-'}</TableCell>
                <TableCell>{branch.phone || '-'}</TableCell>
                <TableCell>{branch.email || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={branch.isActive ? 'Aktif' : 'Pasif'}
                    color={branch.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{branch._count?.users || 0}</TableCell>
                <TableCell>{branch._count?.orders || 0}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleOpen(branch)} color="primary">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(branch.id)}
                    color="error"
                    disabled={branch._count?.users > 0 || branch._count?.orders > 0}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Şube Düzenle' : 'Yeni Şube'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Şube Kodu"
                fullWidth
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="Örn: SUBE01"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Şube Adı"
                fullWidth
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Adres"
                fullWidth
                multiline
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                label="E-posta"
                fullWidth
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Chip
                label={formData.isActive ? 'Aktif' : 'Pasif'}
                color={formData.isActive ? 'success' : 'default'}
                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                sx={{ cursor: 'pointer' }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!formData.name || !formData.code}>
            {editing ? 'Güncelle' : 'Oluştur'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

