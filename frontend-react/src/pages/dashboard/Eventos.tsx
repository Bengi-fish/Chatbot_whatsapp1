import { useState, useEffect } from 'react';
import { eventosService } from '../../services/eventos.service';
import { EventoForm } from '../../components/EventoForm';
import type { Evento } from '../../types';
import '../dashboard/Clientes.css';
import './Eventos.css';

export function Eventos() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  // const [vistaActual, setVistaActual] = useState<'eventos' | 'logs'>('eventos');

  useEffect(() => {
    loadData();
    
    // Auto-refresh cada 30 segundos
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const eventosData = await eventosService.getAll();
      setEventos(eventosData);
    } catch (error) {
      console.error('Error al cargar eventos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatearFecha = (fecha: Date | string | undefined): string => {
    if (!fecha) return '-';
    try {
      const date = new Date(fecha);
      if (isNaN(date.getTime())) return 'Fecha inválida';
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Error en fecha';
    }
  };

  if (isLoading) return <div className="loading">Cargando eventos...</div>;

  return (
    <div className="clientes-page" style={{ paddingBottom: '6rem' }}>
      <div className="page-header">
        <div className="header-content">
          <div className="header-text">
            <h2>Eventos y Mensajes Masivos</h2>
            <p className="page-subtitle">Crea y gestiona campañas de mensajería</p>
          </div>
        </div>
        <button className="btn-create" onClick={() => setShowForm(true)}>
          + Crear Evento
        </button>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{eventos.length}</div>
          <div className="stat-label">Total Eventos</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {eventos.filter(e => e.estado === 'enviado').length}
          </div>
          <div className="stat-label">Completados</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {eventos.reduce((sum, e) => sum + e.destinatarios.enviados, 0)}
          </div>
          <div className="stat-label">Mensajes Enviados</div>
        </div>
      </div>

      {/* Contenido */}
      <div className="eventos-masivos-container">
        {eventos.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h3>No hay eventos masivos</h3>
            <p>Crea tu primer evento para enviar mensajes a múltiples clientes</p>
            <button className="btn-create" onClick={() => setShowForm(true)}>
              + Crear Evento
            </button>
          </div>
        ) : (
          <div className="eventos-grid">
            {eventos.map(evento => (
              <div key={evento._id} className="evento-card">
                <div className="evento-card-header">
                  <h4>{evento.nombre}</h4>
                  <span className={`badge badge-${evento.estado}`}>
                    {evento.estado}
                  </span>
                </div>
                <p className="evento-mensaje">{evento.mensaje.substring(0, 150)}{evento.mensaje.length > 150 ? '...' : ''}</p>
                {evento.imagenUrl && (
                  <div className="evento-imagen">
                    <img src={evento.imagenUrl} alt="Evento" />
                  </div>
                )}
                <div className="evento-stats">
                  <div className="evento-stat">
                    <svg className="stat-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                      <path d="M23 21V19C23 18.0154 22.6049 17.0902 21.9163 16.4268C21.2277 15.7633 20.3041 15.4189 19.3333 15.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16 3.4C16.9704 3.8177 17.8934 4.1621 18.5816 4.8256C19.2697 5.4891 19.6646 6.4142 19.6646 7.4C19.6646 8.3858 19.2697 9.3109 18.5816 9.9744C17.8934 10.6379 16.9704 10.9823 16 11.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>{evento.destinatarios.total} destinatarios</span>
                  </div>
                  <div className="evento-stat success">
                    <svg className="stat-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>{evento.destinatarios.enviados} enviados</span>
                  </div>
                  {evento.destinatarios.fallidos > 0 && (
                    <div className="evento-stat error">
                      <svg className="stat-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <span>{evento.destinatarios.fallidos} fallidos</span>
                    </div>
                  )}
                </div>
                <div className="evento-footer">
                  <small>Creado: {formatearFecha(evento.fechaCreacion)}</small>
                  <br />
                  {evento.fechaEnvio && (
                    <small>Enviado: {formatearFecha(evento.fechaEnvio)}</small>
                  )}
                  <br />
                  <small className="text-muted">Por: {evento.creadoPor}</small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de creación */}
      {showForm && (
        <EventoForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            loadData();
          }}
        />
      )}
    </div>
  );
}
