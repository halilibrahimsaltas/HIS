import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Checkbox,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const TEST_CATEGORIES = [
  { value: 'BIO', label: '1-BIO', name: 'Biyokimya' },
  { value: 'HEM', label: '2-HEM', name: 'Hematoloji' },
  { value: 'URI', label: '3-URI', name: 'İdrar' },
  { value: 'HOR', label: '4-HOR', name: 'Hormon' },
  { value: 'KOA', label: '5-KOA', name: 'Koagülasyon' },
  { value: 'PCR', label: '6-PCR', name: 'PCR' },
  { value: 'A1C', label: '7-A1C', name: 'HbA1c' },
  { value: 'ESR', label: '8-ESR', name: 'Sedimantasyon' },
  { value: 'KAN', label: '9-KAN', name: 'Kan Grubu' },
  { value: 'MIC', label: 'A-MİK', name: 'Mikrobiyoloji' },
  { value: 'IMM', label: 'B-İMM', name: 'İmmünoloji' },
];

export default function TestSelection() {
  const { patientId } = useParams();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patient, setPatient] = useState(null);
  const [tests, setTests] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]); // [{ testId, parameterIds: [] }]
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [parameterDialogOpen, setParameterDialogOpen] = useState(false);
  const [currentTestForParams, setCurrentTestForParams] = useState(null);
  const [order, setOrder] = useState(null);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [discountExplanation, setDiscountExplanation] = useState('');

  useEffect(() => {
    if (patientId) {
      fetchPatient();
      fetchTests();
      if (orderId) {
        fetchOrder();
      }
    }
  }, [patientId, orderId]);

  const fetchPatient = async () => {
    try {
      const response = await api.get(`/patients/${patientId}`);
      setPatient(response.data);
    } catch (error) {
      console.error('Hasta bilgileri yüklenemedi:', error);
      alert('Hasta bulunamadı');
      navigate('/patients');
    }
  };

  const fetchTests = async () => {
    try {
      const response = await api.get('/tests');
      setTests(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Testler yüklenemedi:', error);
      setLoading(false);
    }
  };

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      setOrder(response.data);
      // Mevcut seçimleri yükle
      const selections = response.data.tests.map((ot) => ({
        testId: ot.testId,
        parameterIds: ot.parameters.map((p) => p.testParameterId),
      }));
      setSelectedTests(selections);
      // İndirim bilgilerini yükle
      if (response.data.discountPercentage) {
        setDiscountPercentage(response.data.discountPercentage);
      }
      if (response.data.discountExplanation) {
        setDiscountExplanation(response.data.discountExplanation);
      }
    } catch (error) {
      console.error('Test istemi yüklenemedi:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleTestToggle = (testId) => {
    setSelectedTests((prev) => {
      const existing = prev.find((s) => s.testId === testId);
      if (existing) {
        return prev.filter((s) => s.testId !== testId);
      } else {
        const test = tests.find((t) => t.id === testId);
        // Test seçildiğinde tüm parametreleri varsayılan olarak seç
        const defaultParams = test?.parameters ? test.parameters.map((p) => p.id) : [];
        return [...prev, { testId, parameterIds: defaultParams }];
      }
    });
  };

  const handleParameterSelection = (testId, parameterIds) => {
    setSelectedTests((prev) => {
      const existing = prev.find((s) => s.testId === testId);
      if (existing) {
        return prev.map((s) =>
          s.testId === testId ? { ...s, parameterIds } : s
        );
      } else {
        return [...prev, { testId, parameterIds }];
      }
    });
    setParameterDialogOpen(false);
    setCurrentTestForParams(null);
  };

  const openParameterDialog = (test) => {
    const selection = selectedTests.find((s) => s.testId === test.id);
    setCurrentTestForParams({
      ...test,
      selectedParameterIds: selection?.parameterIds || [],
    });
    setParameterDialogOpen(true);
  };

  const handleCategoryToggle = (category) => {
    const categoryTests = tests.filter((t) => t.category === category);
    const selectedInCategory = categoryTests.filter((t) =>
      selectedTests.some((s) => s.testId === t.id)
    );
    const allSelected = selectedInCategory.length === categoryTests.length;

    if (allSelected) {
      // Tümünü kaldır
      setSelectedTests((prev) =>
        prev.filter((s) => !categoryTests.some((t) => t.id === s.testId))
      );
    } else {
      // Tümünü ekle
      const newSelections = categoryTests
        .filter((t) => !selectedTests.some((s) => s.testId === t.id))
        .map((t) => ({
          testId: t.id,
          parameterIds: t.parameters ? t.parameters.map((p) => p.id) : [],
        }));
      setSelectedTests((prev) => [...prev, ...newSelections]);
    }
  };

  const handleSubmit = async () => {
    if (selectedTests.length === 0) {
      alert('Lütfen en az bir test seçin');
      return;
    }

    try {
      const payload = {
        patientId: parseInt(patientId),
        tests: selectedTests,
      };

      // Sadece ADMIN ve CHIEF_PHYSICIAN için indirim alanlarını ekle
      if (user?.role === 'ADMIN' || user?.role === 'CHIEF_PHYSICIAN') {
        if (discountPercentage > 0) {
          payload.discountPercentage = discountPercentage;
        }
        if (discountExplanation) {
          payload.discountExplanation = discountExplanation;
        }
      }

      if (orderId) {
        await api.put(`/orders/${orderId}`, payload);
        alert('Test istemi başarıyla güncellendi');
      } else {
        await api.post('/orders', payload);
        alert('Test istemi başarıyla oluşturuldu');
      }
      navigate('/orders');
    } catch (error) {
      console.error('Test istemi kaydedilemedi:', error);
      alert('Hata: ' + (error.response?.data?.message || 'Bilinmeyen hata'));
    }
  };

  const getTestsByCategory = (category) => {
    return tests.filter((test) => test.category === category);
  };

  const getSelectedTestsData = () => {
    return selectedTests.map((selection) => {
      const test = tests.find((t) => t.id === selection.testId);
      const selectedParams = test?.parameters
        ? test.parameters.filter((p) => selection.parameterIds.includes(p.id))
        : [];
      return { test, selectedParams };
    });
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return '';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return <Container>Yükleniyor...</Container>;
  }

  if (!patient) {
    return <Container>Hasta bulunamadı</Container>;
  }

  const activeCategory = TEST_CATEGORIES[activeTab]?.value;
  const categoryTests = getTestsByCategory(activeCategory);
  const selectedTestsData = getSelectedTestsData();
  const categoryTestsSelected = categoryTests.every((t) =>
    selectedTests.some((s) => s.testId === t.id)
  );
  const categoryTestsSomeSelected =
    categoryTests.some((t) => selectedTests.some((s) => s.testId === t.id)) &&
    !categoryTestsSelected;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Grid container spacing={2}>
        {/* Sol Panel - Hasta Bilgileri */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, height: '100%', position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              Hasta Bilgileri
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Hasta No
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {patient.id}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Ad Soyad
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {patient.firstName} {patient.lastName}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Baba Adı
              </Typography>
              <Typography variant="body1">{patient.fatherName}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Doğum Tarihi
              </Typography>
              <Typography variant="body1">
                {new Date(patient.birthDate).toLocaleDateString('tr-TR')} ({calculateAge(patient.birthDate)} yaş)
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Cinsiyet
              </Typography>
              <Typography variant="body1">
                {patient.gender === 'MALE' ? 'Erkek' : patient.gender === 'FEMALE' ? 'Kadın' : '-'}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Telefon
              </Typography>
              <Typography variant="body1">{patient.phone || '-'}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                E-posta
              </Typography>
              <Typography variant="body1">{patient.email || '-'}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Adres
              </Typography>
              <Typography variant="body1">{patient.address || '-'}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Seçilen Test Sayısı
              </Typography>
              <Typography variant="h5" color="primary">
                {selectedTests.length}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Sağ Panel - Test Seçimi */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                {orderId ? 'Test İstemi Düzenle' : 'Test Seçimi'}
              </Typography>
              <Box>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={() => navigate('/patients')}
                  sx={{ mr: 1 }}
                >
                  İptal
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSubmit}
                  disabled={selectedTests.length === 0}
                >
                  {orderId ? 'Güncelle' : 'Kaydet'}
                </Button>
              </Box>
            </Box>

            {/* İndirim Alanları - Sadece ADMIN ve CHIEF_PHYSICIAN için */}
            {(user?.role === 'ADMIN' || user?.role === 'CHIEF_PHYSICIAN') && (
              <Box sx={{ mb: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                  İndirim Bilgileri
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="İndirim Yüzdesi (%)"
                      type="number"
                      fullWidth
                      value={discountPercentage}
                      onChange={(e) => setDiscountPercentage(parseFloat(e.target.value) || 0)}
                      inputProps={{ min: 0, max: 100, step: 0.1 }}
                      helperText="0-100 arası değer giriniz"
                    />
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <TextField
                      label="İndirim Açıklaması"
                      fullWidth
                      value={discountExplanation}
                      onChange={(e) => setDiscountExplanation(e.target.value)}
                      placeholder="İndirim nedenini açıklayınız"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Kategori Sekmeleri */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
              >
                {TEST_CATEGORIES.map((cat) => {
                  const catTests = getTestsByCategory(cat.value);
                  const allSelected = catTests.length > 0 && catTests.every((t) =>
                    selectedTests.some((s) => s.testId === t.id)
                  );
                  const someSelected = catTests.some((t) =>
                    selectedTests.some((s) => s.testId === t.id)
                  ) && !allSelected;

                  return (
                    <Tab
                      key={cat.value}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>{cat.label}</span>
                          {allSelected && <Chip label="✓" size="small" color="primary" />}
                          {someSelected && <Chip label="~" size="small" color="warning" />}
                        </Box>
                      }
                    />
                  );
                })}
              </Tabs>
            </Box>

            {/* Test Listesi */}
            {categoryTests.length > 0 ? (
              <Box>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={categoryTestsSelected}
                      indeterminate={categoryTestsSomeSelected}
                      onChange={() => handleCategoryToggle(activeCategory)}
                    />
                  }
                  label={`Tüm ${TEST_CATEGORIES[activeTab]?.name} Testlerini Seç`}
                  sx={{ mb: 2 }}
                />
                <Grid container spacing={2}>
                  {categoryTests.map((test) => {
                    const isSelected = selectedTests.some((s) => s.testId === test.id);
                    const selection = selectedTests.find((s) => s.testId === test.id);
                    const selectedParamCount = selection?.parameterIds?.length || 0;
                    const totalParamCount = test.parameters?.length || 0;

                    return (
                      <Grid item xs={12} sm={6} md={4} key={test.id}>
                        <Card
                          variant="outlined"
                          sx={{
                            cursor: 'pointer',
                            border: isSelected ? 2 : 1,
                            borderColor: isSelected ? 'primary.main' : 'divider',
                            bgcolor: isSelected ? 'action.selected' : 'background.paper',
                          }}
                          onClick={() => handleTestToggle(test.id)}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                              <Checkbox
                                checked={isSelected}
                                onChange={() => handleTestToggle(test.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                  {test.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {test.code} - {test.sampleType}
                                </Typography>
                                {isSelected && totalParamCount > 0 && (
                                  <Typography variant="caption" color="primary" display="block" sx={{ mt: 0.5 }}>
                                    {selectedParamCount}/{totalParamCount} parametre seçili
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                            {isSelected && test.parameters && test.parameters.length > 0 && (
                              <Box sx={{ mt: 1, pl: 5 }}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openParameterDialog(test);
                                  }}
                                  sx={{ mt: 1 }}
                                >
                                  Parametreleri Düzenle ({selectedParamCount}/{totalParamCount})
                                </Button>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            ) : (
              <Alert severity="info">
                Bu kategoride henüz test bulunmamaktadır.
              </Alert>
            )}
          </Paper>

          {/* Seçilen Testler Özeti */}
          {selectedTestsData.length > 0 && (
            <Paper sx={{ p: 2, mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Seçilen Testler ve Parametreleri
              </Typography>
              <Divider sx={{ my: 2 }} />
              <List>
                {selectedTestsData.map(({ test, selectedParams }, index) => {
                  if (!test) return null;
                  const selection = selectedTests.find((s) => s.testId === test.id);

                  return (
                    <Accordion key={test.id} defaultExpanded={index === 0}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                          <Typography variant="subtitle1" fontWeight="bold" sx={{ flex: 1 }}>
                            {test.name}
                          </Typography>
                          <Chip label={test.code} size="small" />
                          <Chip label={test.sampleType} size="small" variant="outlined" />
                          <Chip
                            label={`${selectedParams.length}/${test.parameters?.length || 0} parametre`}
                            size="small"
                            color="primary"
                          />
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              openParameterDialog(test);
                            }}
                            color="primary"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTestToggle(test.id);
                            }}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        {selectedParams.length > 0 ? (
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                              Seçilen Parametreler:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selectedParams.map((param) => (
                                <Chip
                                  key={param.id}
                                  label={`${param.name}${param.unit ? ` (${param.unit})` : ''}`}
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                />
                              ))}
                            </Box>
                            {test.parameters && selectedParams.length < test.parameters.length && (
                              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                {test.parameters.length - selectedParams.length} parametre seçilmedi
                              </Typography>
                            )}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Bu test için parametre seçilmedi. Tüm parametreler çalışılacak.
                          </Typography>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
              </List>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Parametre Seçim Dialog */}
      <Dialog
        open={parameterDialogOpen}
        onClose={() => {
          setParameterDialogOpen(false);
          setCurrentTestForParams(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentTestForParams?.name} - Parametre Seçimi
        </DialogTitle>
        <DialogContent>
          {currentTestForParams && (
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={
                      currentTestForParams.parameters?.every((p) =>
                        currentTestForParams.selectedParameterIds.includes(p.id)
                      ) || false
                    }
                    indeterminate={
                      currentTestForParams.parameters?.some((p) =>
                        currentTestForParams.selectedParameterIds.includes(p.id)
                      ) &&
                      !currentTestForParams.parameters?.every((p) =>
                        currentTestForParams.selectedParameterIds.includes(p.id)
                      )
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        const allIds = currentTestForParams.parameters?.map((p) => p.id) || [];
                        handleParameterSelection(currentTestForParams.id, allIds);
                      } else {
                        handleParameterSelection(currentTestForParams.id, []);
                      }
                    }}
                  />
                }
                label="Tüm Parametreleri Seç"
                sx={{ mb: 2 }}
              />
              <Grid container spacing={2}>
                {currentTestForParams.parameters?.map((param) => (
                  <Grid item xs={12} sm={6} md={4} key={param.id}>
                    <Card
                      variant="outlined"
                      sx={{
                        cursor: 'pointer',
                        border: currentTestForParams.selectedParameterIds.includes(param.id) ? 2 : 1,
                        borderColor: currentTestForParams.selectedParameterIds.includes(param.id)
                          ? 'primary.main'
                          : 'divider',
                        bgcolor: currentTestForParams.selectedParameterIds.includes(param.id)
                          ? 'action.selected'
                          : 'background.paper',
                      }}
                      onClick={() => {
                        const currentIds = currentTestForParams.selectedParameterIds;
                        const newIds = currentIds.includes(param.id)
                          ? currentIds.filter((id) => id !== param.id)
                          : [...currentIds, param.id];
                        setCurrentTestForParams({
                          ...currentTestForParams,
                          selectedParameterIds: newIds,
                        });
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Checkbox
                            checked={currentTestForParams.selectedParameterIds.includes(param.id)}
                            onChange={() => {
                              const currentIds = currentTestForParams.selectedParameterIds;
                              const newIds = currentIds.includes(param.id)
                                ? currentIds.filter((id) => id !== param.id)
                                : [...currentIds, param.id];
                              setCurrentTestForParams({
                                ...currentTestForParams,
                                selectedParameterIds: newIds,
                              });
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight="bold">
                              {param.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {param.code} {param.unit && `- ${param.unit}`}
                            </Typography>
                            {param.referenceRange && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                Ref: {param.referenceRange}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setParameterDialogOpen(false);
              setCurrentTestForParams(null);
            }}
          >
            İptal
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (currentTestForParams) {
                handleParameterSelection(
                  currentTestForParams.id,
                  currentTestForParams.selectedParameterIds
                );
              }
            }}
          >
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
