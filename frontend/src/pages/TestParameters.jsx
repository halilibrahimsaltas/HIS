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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function TestParameters() {
  const [parameters, setParameters] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    unit: '',
    referenceRange: '',
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchParameters();
  }, []);

  const fetchParameters = async () => {
    try {
      const response = await api.get('/test-parameters');
      setParameters(response.data);
    } catch (error) {
      console.error('Parametreler yüklenemedi:', error);
    }
  };

  const handleOpen = (parameter = null) => {
    if (parameter) {
      setEditing(parameter);
      setFormData({
        code: parameter.code,
        name: parameter.name,
        unit: parameter.unit || '',
        referenceRange: parameter.referenceRange || '',
      });
    } else {
      setEditing(null);
      setFormData({
        code: '',
        name: '',
        unit: '',
        referenceRange: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    setFormData({
      code: '',
      name: '',
      unit: '',
      referenceRange: '',
    });
  };

  const handleSubmit = async () => {
    if (!formData.code.trim() || !formData.name.trim()) {
      alert('Kod ve Ad alanları zorunludur');
      return;
    }

    try {
      const data = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        unit: formData.unit.trim() || undefined,
        referenceRange: formData.referenceRange.trim() || undefined,
      };
      if (editing) {
        await api.patch(`/test-parameters/${editing.id}`, data);
      } else {
        await api.post('/test-parameters', data);
      }
      fetchParameters();
      handleClose();
    } catch (error) {
      console.error('Parametre kaydedilemedi:', error);
      alert('Hata: ' + (error.response?.data?.message || 'Bilinmeyen hata'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu parametreyi silmek istediğinize emin misiniz?')) {
      return;
    }
    try {
      await api.delete(`/test-parameters/${id}`);
      fetchParameters();
    } catch (error) {
      console.error('Parametre silinemedi:', error);
      alert('Hata: ' + (error.response?.data?.message || 'Bilinmeyen hata'));
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Test Parametreleri</Typography>
        {user?.role === 'ADMIN' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            Yeni Parametre
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Kod</TableCell>
              <TableCell>Ad</TableCell>
              <TableCell>Birim</TableCell>
              <TableCell>Referans Aralık</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {parameters.map((param) => (
              <TableRow key={param.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {param.code}
                  </Typography>
                </TableCell>
                <TableCell>{param.name}</TableCell>
                <TableCell>{param.unit || '-'}</TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {param.referenceRange || '-'}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  {user?.role === 'ADMIN' && (
                    <>
                      <IconButton
                        size="small"
                        onClick={() => handleOpen(param)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(param.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Parametre Düzenle' : 'Yeni Parametre'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Kod *"
                fullWidth
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                helperText="Benzersiz kod (örn: GLU, HGB)"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Birim"
                fullWidth
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                helperText="Örn: mg/dL, g/L, %"
                placeholder="mg/dL"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Ad *"
                fullWidth
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                helperText="Parametre adı"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Referans Aralık"
                fullWidth
                multiline
                rows={2}
                value={formData.referenceRange}
                onChange={(e) => setFormData({ ...formData, referenceRange: e.target.value })}
                helperText="Örn: 70-100, <200, >40, Erkek: 4.5-5.5 / Kadın: 4.0-5.0"
                placeholder="70-100"
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

