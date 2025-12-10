import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        <div>Verificando autenticación...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Limpiar datos antes de redirigir
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
