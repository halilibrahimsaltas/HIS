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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const ROLES = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'RECEPTION', label: 'Kasiyer/Resepsiyon' },
  { value: 'LAB', label: 'Laborant' },
  { value: 'CHIEF_PHYSICIAN', label: 'Baş Hekim' },
];

export default function Users() {
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    branchId: '',
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchUsers();
    fetchBranches();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Kullanıcılar yüklenemedi:', error);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await api.get('/branches/active');
      setBranches(response.data);
    } catch (error) {
      console.error('Şubeler yüklenemedi:', error);
    }
  };

  const handleOpen = (userItem = null) => {
    if (userItem && userItem.id) {
      setEditing(userItem);
      setFormData({
        name: userItem.name,
        email: userItem.email,
        password: '',
        role: userItem.role,
        branchId: userItem.branchId ? userItem.branchId.toString() : '',
      });
    } else {
      setEditing(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: '',
        branchId: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: '',
      branchId: '',
    });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        branchId: formData.branchId ? parseInt(formData.branchId) : null,
      };

      // Only include password if it's provided (for updates) or if creating new user
      if (!(editing && editing.id) || formData.password) {
        payload.password = formData.password;
      }

      if (editing && editing.id) {
        await api.patch(`/users/${editing.id}`, payload);
        alert('Kullanıcı başarıyla güncellendi');
      } else {
        await api.put('/users', payload);
        alert('Kullanıcı başarıyla oluşturuldu');
      }
      fetchUsers();
      handleClose();
    } catch (error) {
      console.error('Kullanıcı kaydedilemedi:', error);
      alert('Hata: ' + (error.response?.data?.message || 'Bilinmeyen hata'));
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await api.delete(`/users/${userId}`);
      alert('Kullanıcı başarıyla silindi');
      fetchUsers();
    } catch (error) {
      console.error('Kullanıcı silinemedi:', error);
      alert('Hata: ' + (error.response?.data?.message || 'Bilinmeyen hata'));
    }
  };

  const getRoleLabel = (role) => {
    return ROLES.find((r) => r.value === role)?.label || role;
  };

  const requiresBranch = (role) => {
    return role === 'RECEPTION' || role === 'LAB';
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
        <Typography variant="h4">Kullanıcılar</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
          Yeni Kullanıcı
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ad</TableCell>
              <TableCell>E-posta</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Şube</TableCell>
              <TableCell>Oluşturulma</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((userItem) => (
              <TableRow key={userItem.id}>
                <TableCell>{userItem.name}</TableCell>
                <TableCell>{userItem.email}</TableCell>
                <TableCell>
                  <Chip label={getRoleLabel(userItem.role)} size="small" color="primary" />
                </TableCell>
                <TableCell>{userItem.branch ? `${userItem.branch.name} (${userItem.branch.code})` : '-'}</TableCell>
                <TableCell>{new Date(userItem.createdAt).toLocaleDateString('tr-TR')}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleOpen(userItem)} color="primary">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(userItem.id)} color="error">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editing && editing.id ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Ad Soyad"
                fullWidth
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="E-posta"
                fullWidth
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label={editing && editing.id ? 'Şifre (Değiştirmek için doldurun)' : 'Şifre'}
                fullWidth
                required={!(editing && editing.id)}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                helperText={editing && editing.id ? 'Şifreyi değiştirmek istemiyorsanız boş bırakın' : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Rol *</InputLabel>
                <Select
                  value={formData.role}
                  label="Rol *"
                  onChange={(e) => {
                    const newRole = e.target.value;
                    setFormData({
                      ...formData,
                      role: newRole,
                      branchId: requiresBranch(newRole) ? formData.branchId : '',
                    });
                  }}
                >
                  {ROLES.map((role) => (
                    <MenuItem key={role.value} value={role.value}>
                      {role.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {requiresBranch(formData.role) && (
              <Grid item xs={12}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Şube *</InputLabel>
                  <Select
                    value={formData.branchId}
                    label="Şube *"
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    required
                  >
                    {branches.map((branch) => (
                      <MenuItem key={branch.id} value={branch.id}>
                        {branch.name} ({branch.code})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>İptal</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              !formData.name ||
              !formData.email ||
              (!(editing && editing.id) && !formData.password) ||
              !formData.role ||
              (requiresBranch(formData.role) && !formData.branchId)
            }
          >
            {editing && editing.id ? 'Güncelle' : 'Oluştur'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

