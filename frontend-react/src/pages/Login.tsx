import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MdDashboard, MdPeople, MdShoppingCart, MdChat } from 'react-icons/md';
import './Login.css';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    console.log('📝 Formulario enviado');
    console.log('Email:', email);

    try {
      await login({ email, password });
      console.log('✅ Login exitoso, redirigiendo...');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('❌ Error en login:', err);
      console.error('Response:', err.response);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Error al iniciar sesión';
      console.error('Mensaje de error:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Panel izquierdo con menú */}
      <div className="login-sidebar">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          <div className="sidebar-logo">
            <img 
              src="/assets/images/LOGO_AVELLANO.png" 
              alt="Logo Avellano"
            />
          </div>
        </div>

        <div className="sidebar-menu">
          <div className="menu-item">
            <div className="menu-item-icon"><MdDashboard /></div>
            <div className="menu-item-content">
              <div className="menu-item-title">Dashboard</div>
              <div className="menu-item-subtitle">Datos en tiempo real</div>
            </div>
          </div>

          <div className="menu-item">
            <div className="menu-item-icon"><MdPeople /></div>
            <div className="menu-item-content">
              <div className="menu-item-title">Clientes</div>
              <div className="menu-item-subtitle">Gestión integral</div>
            </div>
          </div>

          <div className="menu-item">
            <div className="menu-item-icon"><MdShoppingCart /></div>
            <div className="menu-item-content">
              <div className="menu-item-title">Pedidos</div>
              <div className="menu-item-subtitle">Control total</div>
            </div>
          </div>

          <div className="menu-item">
            <div className="menu-item-icon"><MdChat /></div>
            <div className="menu-item-content">
              <div className="menu-item-title">Conversaciones</div>
              <div className="menu-item-subtitle">Historial completo</div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel derecho con formulario */}
      <div className="login-form-panel">
        <div className="login-form-container">
          <div className="login-header">
            <h1>Bienvenido</h1>
            <p>Accede a tu panel de control</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">CORREO ELECTRÓNICO</label>
              <div className="input-wrapper">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operador1@avellano.com"
                  required
                  autoFocus
                />
                <div className="input-icon">—</div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">CONTRASEÑA</label>
              <div className="input-wrapper">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  required
                />
                <div className="input-icon">—</div>
              </div>
            </div>

            <button 
              type="submit" 
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Ingresar al Dashboard'}
            </button>

            <div className="forgot-password">
              <a href="/forgot-password" onClick={() => navigate('/forgot-password')}>
                ¿Olvidó su contraseña?
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
