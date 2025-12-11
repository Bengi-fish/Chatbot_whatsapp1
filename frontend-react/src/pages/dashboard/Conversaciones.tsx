import { useState, useEffect } from 'react';
import { conversacionesService } from '../../services/conversaciones.service';
import { ConversacionDetalle } from '../../components/ConversacionDetalle';
import type { Conversacion } from '../../types';
import '../dashboard/Clientes.css';

export function Conversaciones() {
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [conversacionesFiltradas, setConversacionesFiltradas] = useState<Conversacion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [conversacionSeleccionada, setConversacionSeleccionada] = useState<string | null>(null);

  useEffect(() => {
    loadConversaciones();
    
    // Auto-refresh cada 30 segundos
    const interval = setInterval(loadConversaciones, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filtrarConversaciones();
  }, [conversaciones, searchTerm]);

  const loadConversaciones = async () => {
    try {
      const data = await conversacionesService.getAll();
      setConversaciones(data);
      setConversacionesFiltradas(data);
    } catch (error) {
      console.error('Error al cargar conversaciones:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filtrarConversaciones = () => {
    if (!searchTerm) {
      setConversacionesFiltradas(conversaciones);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = conversaciones.filter(c =>
      (c.nombreCliente || '').toLowerCase().includes(term) ||
      (c.nombreNegocio || '').toLowerCase().includes(term) ||
      (c.telefono || '').toLowerCase().includes(term) ||
      (c.flujoActual || '').toLowerCase().includes(term)
    );
    setConversacionesFiltradas(filtered);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">⏳</div>
        <p>Cargando conversaciones...</p>
      </div>
    );
  }

  return (
    <div className="clientes-page conversaciones-page" style={{ paddingBottom: '6rem' }}>
      <div className="page-header">
        <div className="header-content">
          <div className="header-text">
            <h2>Gestión de Conversaciones</h2>
            <p className="page-subtitle">Administra y monitorea las interacciones con clientes</p>
          </div>
        </div>
      </div>

      <div className="search-wrapper">
        <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
          <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <input
          type="text"
          placeholder="Buscar por cliente, teléfono o flujo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {searchTerm && (
          <button className="clear-search" onClick={() => setSearchTerm('')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{conversaciones.length}</div>
          <div className="stat-label">Total Conversaciones</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {conversaciones.filter(c => c.estado === 'activa').length}
          </div>
          <div className="stat-label">Activas</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {conversaciones.filter(c => c.estado === 'finalizada').length}
          </div>
          <div className="stat-label">Finalizadas</div>
        </div>
      </div>

      <div className="table-container">
        {conversacionesFiltradas.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-state-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="9" y1="9" x2="15" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="9" y1="13" x2="13" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <p>
              {searchTerm
                ? 'No se encontraron conversaciones con los criterios de búsqueda'
                : 'No hay conversaciones registradas'}
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Tipo</th>
                <th>Mensajes</th>
                <th>Flujo Actual</th>
                <th>Estado</th>
                <th>Último Mensaje</th>
              </tr>
            </thead>
            <tbody>
              {conversacionesFiltradas.map((conv) => (
                <tr
                  key={conv._id}
                  className="clickable-row"
                  onClick={() => setConversacionSeleccionada(conv.telefono)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <div>
                      <strong>{conv.nombreNegocio || conv.nombreCliente || '-'}</strong>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        📱 {conv.telefono}
                      </div>
                    </div>
                  </td>
                  <td>
                    {conv.tipoCliente ? (
                      <span className={`badge badge-${conv.tipoCliente}`}>
                        {conv.tipoCliente.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="text-center">
                    <strong>{conv.mensajes?.length || 0}</strong>
                  </td>
                  <td>{conv.flujoActual || 'N/A'}</td>
                  <td>
                    {conv.estado ? (
                      <span className={`badge badge-${conv.estado}`}>
                        {conv.estado.toUpperCase()}
                      </span>
                    ) : (
                      <span className="badge badge-info">N/A</span>
                    )}
                  </td>
                  <td>
                    {(() => {
                      const fecha = conv.fechaUltimoMensaje || conv.ultimoMensaje;
                      if (!fecha) return '-';
                      try {
                        return new Date(fecha).toLocaleString('es-CO', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        });
                      } catch (e) {
                        return '-';
                      }
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de detalle */}
      {conversacionSeleccionada && (
        <ConversacionDetalle
          telefono={conversacionSeleccionada}
          onClose={() => setConversacionSeleccionada(null)}
        />
      )}
    </div>
  );
}
