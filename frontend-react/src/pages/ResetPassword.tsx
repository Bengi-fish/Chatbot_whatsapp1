import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_CONFIG } from '../config/api';
import './ResetPassword.css';

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(true);
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setError('Token de recuperación no válido o expirado');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validaciones
    if (!password || !confirmPassword) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_CONFIG.baseURL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: password
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Contraseña restablecida exitosamente. Redirigiendo al inicio de sesión...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.error || 'Error al restablecer la contraseña');
      }
    } catch (err) {
      setError('Error de conexión. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      {/* Left Panel */}
      <div className="reset-password-left">
        <div className="brand-section">
          <img 
            src="/assets/logo.png" 
            alt="Avellano" 
            className="brand-logo"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <h1 className="brand-name">Avellano</h1>
        </div>

        <div className="info-cards">
          <div className="info-card">
            <div className="info-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 15V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <h3>Seguridad</h3>
              <p>Tu nueva contraseña será encriptada</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h3>Nueva Contraseña</h3>
              <p>Crea una contraseña segura</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h3>Acceso Inmediato</h3>
              <p>Inicia sesión al terminar</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h3>Protección</h3>
              <p>Token de un solo uso</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="reset-password-right">
        <div className="reset-password-card">
          <h1 className="reset-title">Restablecer Contraseña</h1>
          <p className="reset-subtitle">
            Ingresa tu nueva contraseña para acceder a tu cuenta
          </p>

          {message && (
            <div className="success-message">
              {message}
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {tokenValid ? (
            <form className="reset-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="password">Nueva Contraseña</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu nueva contraseña"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirma tu nueva contraseña"
                  disabled={isLoading}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Restableciendo...' : 'RESTABLECER CONTRASEÑA'}
              </button>

              <div className="back-to-login">
                <button
                  type="button"
                  className="back-link"
                  onClick={() => navigate('/login')}
                >
                  Volver a iniciar Sesión
                </button>
              </div>
            </form>
          ) : (
            <div className="invalid-token">
              <p>El enlace de recuperación no es válido o ha expirado.</p>
              <button
                className="back-link"
                onClick={() => navigate('/forgot-password')}
              >
                Solicitar nuevo enlace
              </button>
            </div>
          )}

          <div className="security-note">
            <p><strong>⚠️ Recomendaciones de seguridad:</strong></p>
            <p>• Usa al menos 6 caracteres</p>
            <p>• Combina letras, números y símbolos</p>
            <p>• No uses contraseñas obvias o comunes</p>
            <p className="small-text">Este enlace expirará en 1 hora desde que fue generado.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
