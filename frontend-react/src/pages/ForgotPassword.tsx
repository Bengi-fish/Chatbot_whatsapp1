import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_CONFIG } from '../config/api';
import './ForgotPassword.css';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email.trim()) {
      setError('Por favor ingresa tu correo electrónico');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor ingresa un correo electrónico válido');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_CONFIG.baseURL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Se ha enviado un enlace de recuperación a tu correo electrónico. Por favor revisa tu bandeja de entrada.');
        setEmail('');
      } else {
        setError(data.error || 'Error al enviar el enlace de recuperación');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-left">
        <div className="brand-section">
          <img src="/logo.png" alt="Avellano" className="brand-logo" />
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
            <h3>Seguridad</h3>
            <p>Tu información está protegida</p>
          </div>
          <div className="info-card">
            <div className="info-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M3 9L12 14L21 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>Rápido</h3>
            <p>Recupera tu acceso en minutos</p>
          </div>
          <div className="info-card">
            <div className="info-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>Confiable</h3>
            <p>Proceso seguro y encriptado</p>
          </div>
          <div className="info-card">
            <div className="info-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>Comunicaciones</h3>
            <p>Gestión de WhatsApp</p>
          </div>
        </div>
      </div>

      <div className="forgot-password-right">
        <div className="forgot-password-card">
          <div className="avellano-header">
            <img src="/logo.png" alt="Avellano" className="header-logo" />
            <h2>Avellano</h2>
          </div>

          <h1 className="forgot-title">Recuperación de Contraseña</h1>
          <p className="forgot-subtitle">
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
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

          <form onSubmit={handleSubmit} className="forgot-form">
            <div className="form-group">
              <label htmlFor="email">CORREO ELECTRÓNICO</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@avellano.com"
                disabled={isLoading}
                required
              />
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'ENVIANDO...' : 'ENVIAR ENLACE DE RECUPERACIÓN'}
            </button>

            <div className="back-to-login">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="back-link"
              >
                ← Volver a iniciar Sesión
              </button>
            </div>
          </form>

          <div className="security-note">
            <p>⚠️ <strong>Importante:</strong> Este enlace expirará en 1 hora por motivos de seguridad</p>
            <p className="small-text">Si no realizó este cambio, puede ignorar este mensaje y su contraseña permanecerá igual.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
