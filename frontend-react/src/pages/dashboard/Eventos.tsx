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
  const [vistaActual, setVistaActual] = useState<'eventos' | 'logs'>('eventos');

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
        <h2>📢 Eventos y Mensajes Masivos</h2>
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
            <div className="empty-icon">📢</div>
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
                    <span className="stat-icon">👥</span>
                    <span>{evento.destinatarios.total} destinatarios</span>
                  </div>
                  <div className="evento-stat success">
                    <span className="stat-icon">✅</span>
                    <span>{evento.destinatarios.enviados} enviados</span>
                  </div>
                  {evento.destinatarios.fallidos > 0 && (
                    <div className="evento-stat error">
                      <span className="stat-icon">❌</span>
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
