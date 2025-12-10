import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Login } from './pages/Login';
import { Clientes } from './pages/dashboard/Clientes';
import { Pedidos } from './pages/dashboard/Pedidos';
import { Conversaciones } from './pages/dashboard/Conversaciones';
import { Eventos } from './pages/dashboard/Eventos';
import { Usuarios } from './pages/dashboard/Usuarios';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Navigate to="/dashboard/clientes" replace />} />
              <Route path="clientes" element={<Clientes />} />
              <Route path="pedidos" element={<Pedidos />} />
              <Route path="conversaciones" element={<Conversaciones />} />
              <Route path="eventos" element={<Eventos />} />
              <Route path="usuarios" element={<Usuarios />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
