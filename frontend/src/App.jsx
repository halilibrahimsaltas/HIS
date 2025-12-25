import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Orders from './pages/Orders';
import Tests from './pages/Tests';
import TestSelection from './pages/TestSelection';
import SampleAcceptance from './pages/SampleAcceptance';
import Results from './pages/Results';
import ResultPreview from './pages/ResultPreview';
import TestParameters from './pages/TestParameters';
import Devices from './pages/Devices';
import DeviceQueue from './pages/DeviceQueue';
import BarcodePrint from './pages/BarcodePrint';
import Branches from './pages/Branches';
import Users from './pages/Users';
import Layout from './components/Layout';

const theme = createTheme({
  palette: {
    primary: {
      main: '#F57C00', // Koyu sarı (Amber 700)
      light: '#FFB74D', // Açık sarı
      dark: '#E65100', // Daha koyu sarı
      contrastText: '#fff',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="patients" element={<Patients />} />
              <Route path="patients/:patientId/test-selection" element={<TestSelection />} />
              <Route path="orders" element={<Orders />} />
              <Route path="sample-acceptance" element={<SampleAcceptance />} />
              <Route path="results/:orderId" element={<Results />} />
              <Route path="results/:orderId/preview" element={<ResultPreview />} />
              <Route path="tests" element={<Tests />} />
              <Route path="test-parameters" element={<TestParameters />} />
              <Route path="devices" element={<Devices />} />
              <Route path="devices/queue" element={<DeviceQueue />} />
              <Route path="branches" element={<Branches />} />
              <Route path="users" element={<Users />} />
              <Route path="orders/:orderId/barcodes" element={<BarcodePrint />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

