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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const AGE_GROUPS = [
  { value: 'CHILD', label: 'Çocuk (0-18 yaş)' },
  { value: 'ADULT', label: 'Yetişkin (18-65 yaş)' },
  { value: 'ELDERLY', label: 'Yaşlı (65+ yaş)' },
];

const GENDERS = [
  { value: 'MALE', label: 'Erkek' },
  { value: 'FEMALE', label: 'Kadın' },
  { value: 'BOTH', label: 'Her İkisi' },
];

export default function TestParameters() {
  const [parameters, setParameters] = useState([]);
  const [open, setOpen] = useState(false);
  const [rangeDialogOpen, setRangeDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editingRange, setEditingRange] = useState(null);
  const [selectedParameter, setSelectedParameter] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    unit: '',
    referenceRange: '',
  });
  const [rangeFormData, setRangeFormData] = useState({
    ageGroup: '',
    gender: '',
    rangeText: '',
    minValue: '',
    maxValue: '',
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

  const handleOpenRangeDialog = (parameter, range = null) => {
    setSelectedParameter(parameter);
    if (range) {
      setEditingRange(range);
      setRangeFormData({
        ageGroup: range.ageGroup,
        gender: range.gender,
        rangeText: range.rangeText || '',
        minValue: range.minValue?.toString() || '',
        maxValue: range.maxValue?.toString() || '',
      });
    } else {
      setEditingRange(null);
      setRangeFormData({
        ageGroup: '',
        gender: '',
        rangeText: '',
        minValue: '',
        maxValue: '',
      });
    }
    setRangeDialogOpen(true);
  };

  const handleCloseRangeDialog = () => {
    setRangeDialogOpen(false);
    setSelectedParameter(null);
    setEditingRange(null);
    setRangeFormData({
      ageGroup: '',
      gender: '',
      rangeText: '',
      minValue: '',
      maxValue: '',
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

  const handleSubmitRange = async () => {
    if (!rangeFormData.ageGroup || !rangeFormData.gender) {
      alert('Yaş grubu ve cinsiyet seçimi zorunludur');
      return;
    }

    if (!rangeFormData.rangeText && !rangeFormData.minValue && !rangeFormData.maxValue) {
      alert('En az bir referans değeri girmelisiniz (Metin veya Min/Max)');
      return;
    }

    try {
      const data = {
        ageGroup: rangeFormData.ageGroup,
        gender: rangeFormData.gender,
        rangeText: rangeFormData.rangeText.trim() || undefined,
        minValue: rangeFormData.minValue ? parseFloat(rangeFormData.minValue) : undefined,
        maxValue: rangeFormData.maxValue ? parseFloat(rangeFormData.maxValue) : undefined,
      };

      if (editingRange) {
        await api.patch(`/test-parameters/reference-ranges/${editingRange.id}`, data);
      } else {
        await api.post(`/test-parameters/${selectedParameter.id}/reference-ranges`, data);
      }
      fetchParameters();
      handleCloseRangeDialog();
    } catch (error) {
      console.error('Referans aralığı kaydedilemedi:', error);
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

  const handleDeleteRange = async (rangeId) => {
    if (!window.confirm('Bu referans aralığını silmek istediğinize emin misiniz?')) {
      return;
    }
    try {
      await api.delete(`/test-parameters/reference-ranges/${rangeId}`);
      fetchParameters();
    } catch (error) {
      console.error('Referans aralığı silinemedi:', error);
      alert('Hata: ' + (error.response?.data?.message || 'Bilinmeyen hata'));
    }
  };

  const getRangeDisplay = (range) => {
    if (range.rangeText) {
      return range.rangeText;
    }
    if (range.minValue !== null && range.maxValue !== null) {
      return `${range.minValue} - ${range.maxValue}`;
    }
    if (range.minValue !== null) {
      return `> ${range.minValue}`;
    }
    if (range.maxValue !== null) {
      return `< ${range.maxValue}`;
    }
    return '-';
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

      {parameters.map((param) => (
        <Accordion key={param.id} sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {param.name} ({param.code})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Birim: {param.unit || '-'} | Genel Referans: {param.referenceRange || '-'}
                </Typography>
              </Box>
              {user?.role === 'ADMIN' && (
                <Box>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpen(param);
                    }}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(param.id);
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
                  Yaş ve Cinsiyete Göre Referans Aralıkları
                </Typography>
                {user?.role === 'ADMIN' && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenRangeDialog(param)}
                  >
                    Yeni Referans Aralığı
                  </Button>
                )}
              </Box>

              {param.referenceRanges && param.referenceRanges.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Yaş Grubu</TableCell>
                        <TableCell>Cinsiyet</TableCell>
                        <TableCell>Referans Aralık</TableCell>
                        {user?.role === 'ADMIN' && <TableCell align="right">İşlemler</TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {param.referenceRanges.map((range) => (
                        <TableRow key={range.id}>
                          <TableCell>
                            {AGE_GROUPS.find((g) => g.value === range.ageGroup)?.label || range.ageGroup}
                          </TableCell>
                          <TableCell>
                            {GENDERS.find((g) => g.value === range.gender)?.label || range.gender}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {getRangeDisplay(range)}
                            </Typography>
                          </TableCell>
                          {user?.role === 'ADMIN' && (
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenRangeDialog(param, range)}
                                color="primary"
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteRange(range.id)}
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
                  Henüz referans aralığı tanımlanmamış.
                </Typography>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Parametre Dialog */}
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
                label="Genel Referans Aralık (Opsiyonel)"
                fullWidth
                multiline
                rows={2}
                value={formData.referenceRange}
                onChange={(e) => setFormData({ ...formData, referenceRange: e.target.value })}
                helperText="Genel referans aralığı (yaş/cinsiyet spesifik değil)"
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

      {/* Referans Aralığı Dialog */}
      <Dialog open={rangeDialogOpen} onClose={handleCloseRangeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingRange ? 'Referans Aralığı Düzenle' : 'Yeni Referans Aralığı'}
          {selectedParameter && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Parametre: {selectedParameter.name} ({selectedParameter.code})
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense" required>
                <InputLabel>Yaş Grubu *</InputLabel>
                <Select
                  value={rangeFormData.ageGroup}
                  label="Yaş Grubu *"
                  onChange={(e) => setRangeFormData({ ...rangeFormData, ageGroup: e.target.value })}
                >
                  {AGE_GROUPS.map((group) => (
                    <MenuItem key={group.value} value={group.value}>
                      {group.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense" required>
                <InputLabel>Cinsiyet *</InputLabel>
                <Select
                  value={rangeFormData.gender}
                  label="Cinsiyet *"
                  onChange={(e) => setRangeFormData({ ...rangeFormData, gender: e.target.value })}
                >
                  {GENDERS.map((g) => (
                    <MenuItem key={g.value} value={g.value}>
                      {g.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" gutterBottom>
                Referans Değeri (Metin veya Sayısal)
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Metin Formatı (Opsiyonel)"
                fullWidth
                value={rangeFormData.rangeText}
                onChange={(e) => setRangeFormData({ ...rangeFormData, rangeText: e.target.value })}
                helperText="Örn: 70-100, <200, >40, Negatif/Pozitif"
                placeholder="70-100"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Minimum Değer (Opsiyonel)"
                fullWidth
                type="number"
                value={rangeFormData.minValue}
                onChange={(e) => setRangeFormData({ ...rangeFormData, minValue: e.target.value })}
                helperText="Sayısal minimum değer"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Maksimum Değer (Opsiyonel)"
                fullWidth
                type="number"
                value={rangeFormData.maxValue}
                onChange={(e) => setRangeFormData({ ...rangeFormData, maxValue: e.target.value })}
                helperText="Sayısal maksimum değer"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRangeDialog}>İptal</Button>
          <Button onClick={handleSubmitRange} variant="contained">
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
