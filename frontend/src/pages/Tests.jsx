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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Checkbox,
  ListItemText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const TEST_CATEGORIES = [
  { value: 'BIO', label: 'Biyokimya (BIO)' },
  { value: 'HEM', label: 'Hematoloji (HEM)' },
  { value: 'URI', label: 'İdrar (URI)' },
  { value: 'HOR', label: 'Hormon (HOR)' },
  { value: 'COA', label: 'Koagülasyon (COA)' },
  { value: 'PCR', label: 'PCR' },
  { value: 'A1C', label: 'HbA1c (A1C)' },
  { value: 'ESR', label: 'Sedimantasyon (ESR)' },
  { value: 'SER', label: 'Seroloji (SER)' },
  { value: 'IMM', label: 'İmmünoloji (IMM)' },
  { value: 'MIC', label: 'Mikrobiyoloji (MIC)' },
  { value: 'VIT', label: 'Vitamin (VIT)' },
  { value: 'TOX', label: 'Toksikoloji (TOX)' },
  { value: 'OTHER', label: 'Diğer' },
];

export default function Tests() {
  const [tests, setTests] = useState([]);
  const [parameters, setParameters] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: '',
    price: '',
    sampleType: '',
    parameterIds: [],
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchTests();
    fetchParameters();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await api.get('/tests');
      setTests(response.data);
    } catch (error) {
      console.error('Testler yüklenemedi:', error);
    }
  };

  const fetchParameters = async () => {
    try {
      const response = await api.get('/tests/parameters/all');
      setParameters(response.data);
    } catch (error) {
      console.error('Parametreler yüklenemedi:', error);
    }
  };

  const handleOpen = (test = null) => {
    if (test) {
      setEditing(test);
      setFormData({
        code: test.code,
        name: test.name,
        category: test.category,
        price: test.price.toString(),
        sampleType: test.sampleType,
        parameterIds: test.parameters ? test.parameters.map(p => p.id) : [],
      });
    } else {
      setEditing(null);
      setFormData({
        code: '',
        name: '',
        category: '',
        price: '',
        sampleType: '',
        parameterIds: [],
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
      category: '',
      price: '',
      sampleType: '',
      parameterIds: [],
    });
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        parameterIds: formData.parameterIds.length > 0 ? formData.parameterIds : undefined,
      };
      if (editing) {
        await api.patch(`/tests/${editing.id}`, data);
      } else {
        await api.post('/tests', data);
      }
      fetchTests();
      handleClose();
    } catch (error) {
      console.error('Test kaydedilemedi:', error);
      alert('Hata: ' + (error.response?.data?.message || 'Bilinmeyen hata'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu testi silmek istediğinize emin misiniz?')) {
      return;
    }
    try {
      await api.delete(`/tests/${id}`);
      fetchTests();
    } catch (error) {
      console.error('Test silinemedi:', error);
      alert('Hata: ' + (error.response?.data?.message || 'Bilinmeyen hata'));
    }
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Testler</Typography>
        {user?.role === 'ADMIN' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            Yeni Test
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Kod</TableCell>
              <TableCell>Ad</TableCell>
              <TableCell>Kategori</TableCell>
              <TableCell>Parametreler</TableCell>
              <TableCell>Fiyat</TableCell>
              <TableCell>Numune Tipi</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tests.map((test) => (
              <TableRow key={test.id}>
                <TableCell>{test.code}</TableCell>
                <TableCell>{test.name}</TableCell>
                <TableCell>
                  {TEST_CATEGORIES.find(c => c.value === test.category)?.label || test.category}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 300 }}>
                    {test.parameters && test.parameters.length > 0 ? (
                      test.parameters.slice(0, 3).map((param) => (
                        <Chip key={param.id} label={param.name} size="small" variant="outlined" />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">-</Typography>
                    )}
                    {test.parameters && test.parameters.length > 3 && (
                      <Chip
                        label={`+${test.parameters.length - 3}`}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell>{test.price.toFixed(2)} ₺</TableCell>
                <TableCell>{test.sampleType}</TableCell>
                <TableCell align="right">
                  {user?.role === 'ADMIN' && (
                    <>
                      <IconButton
                        size="small"
                        onClick={() => handleOpen(test)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(test.id)}
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

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Test Düzenle' : 'Yeni Test'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Kod"
                fullWidth
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Kategori *</InputLabel>
                <Select
                  value={formData.category}
                  label="Kategori *"
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  {TEST_CATEGORIES.map((cat) => (
                    <MenuItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Ad"
                fullWidth
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Fiyat"
                type="number"
                fullWidth
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Numune Tipi"
                fullWidth
                required
                value={formData.sampleType}
                onChange={(e) => setFormData({ ...formData, sampleType: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Parametreler (Seçmeli)</InputLabel>
                <Select
                  multiple
                  value={formData.parameterIds}
                  label="Parametreler (Seçmeli)"
                  onChange={(e) => setFormData({ ...formData, parameterIds: e.target.value })}
                  renderValue={(selected) =>
                    selected
                      .map((id) => {
                        const param = parameters.find((p) => p.id === id);
                        return param ? param.name : '';
                      })
                      .filter(Boolean)
                      .join(', ') || 'Parametre seçiniz'
                  }
                >
                  {parameters.map((param) => (
                    <MenuItem key={param.id} value={param.id}>
                      <Checkbox checked={formData.parameterIds.includes(param.id)} />
                      <ListItemText
                        primary={param.name}
                        secondary={`${param.code}${param.unit ? ` - ${param.unit}` : ''}`}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {formData.parameterIds.length > 0 && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ width: '100%', mb: 1 }}>
                    Seçilen Parametreler:
                  </Typography>
                  {formData.parameterIds.map((id) => {
                    const param = parameters.find((p) => p.id === id);
                    return param ? (
                      <Chip
                        key={id}
                        label={`${param.name} (${param.code})`}
                        onDelete={() =>
                          setFormData({
                            ...formData,
                            parameterIds: formData.parameterIds.filter((pid) => pid !== id),
                          })
                        }
                      />
                    ) : null;
                  })}
                </Box>
              </Grid>
            )}
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

