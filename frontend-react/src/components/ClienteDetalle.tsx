import { useState, useEffect } from 'react';
import type { Cliente } from '../types';
import { clientesService } from '../services/clientes.service';
import { pedidosService } from '../services/pedidos.service';
import type { Pedido } from '../types';
import './ClienteDetalle.css';

interface ClienteDetalleProps {
  telefono: string;
  onClose: () => void;
}

const RESPONSABLE_MAP: Record<string, string> = {
  'coordinador_masivos': 'Coordinador de Masivos',
  'director_comercial': 'Director Comercial',
  'ejecutivo_horecas': 'Ejecutivo Horecas',
  'mayorista': 'Coordinador Mayoristas'
};

export function ClienteDetalle({ telefono, onClose }: ClienteDetalleProps) {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCliente();
    loadPedidosCliente();
  }, [telefono]);

  const loadCliente = async () => {
    try {
      const data = await clientesService.getByTelefono(telefono);
      setCliente(data);
    } catch (error) {
      console.error('Error cargando cliente:', error);
      alert('❌ Error cargando información del cliente');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const loadPedidosCliente = async () => {
    try {
      const data = await pedidosService.getByCliente(telefono);
      setPedidos(data);
    } catch (error) {
      console.error('Error cargando pedidos:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content-cliente" onClick={(e) => e.stopPropagation()}>
          <div className="loading">Cargando información del cliente...</div>
        </div>
      </div>
    );
  }

  if (!cliente) return null;

  const tipoIcon = cliente.tipoCliente === 'hogar' ? '🏠' : '🏢';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-cliente" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header-cliente">
          <div className="header-content">
            <div className="header-icon-large">{tipoIcon}</div>
            <div>
              <h2 className="negocio-nombre">{cliente.nombreNegocio || cliente.nombre || 'Sin nombre'}</h2>
              <div className="header-badges">
                <span className="badge-pill badge-tipo">
                  {cliente.tipoCliente.replace(/_/g, ' ')}
                </span>
                <span className="badge-pill badge-resp">
                  {RESPONSABLE_MAP[cliente.responsable || ''] || 'Sin asignar'}
                </span>
              </div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body-cliente">
          {/* Sección de contacto */}
          <div className="section-contacto">
            <div className="contact-item">
              <div className="contact-icon">📱</div>
              <div className="contact-details">
                <span className="contact-label">Teléfono</span>
                <span className="contact-value">{cliente.telefono}</span>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon">👤</div>
              <div className="contact-details">
                <span className="contact-label">Persona de Contacto</span>
                <span className="contact-value">{cliente.personaContacto || 'No especificado'}</span>
              </div>
            </div>
          </div>

          {/* Grid de información */}
          <div className="info-grid-cliente">
            {/* Ubicación */}
            <div className="info-section">
              <div className="section-header">
                <span className="section-icon">📍</span>
                <h3 className="section-title">Ubicación</h3>
              </div>
              <div className="section-body">
                <div className="info-row">
                  <span className="info-label">Ciudad:</span>
                  <span className="info-value">{cliente.ciudad || 'No especificada'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Dirección:</span>
                  <span className="info-value">{cliente.direccion || 'No especificada'}</span>
                </div>
              </div>
            </div>

            {/* Actividad */}
            <div className="info-section">
              <div className="section-header">
                <span className="section-icon">📅</span>
                <h3 className="section-title">Actividad</h3>
              </div>
              <div className="section-body">
                <div className="info-row">
                  <span className="info-label">Registro:</span>
                  <span className="info-value">
                    {new Date(cliente.fechaRegistro).toLocaleDateString('es-CO', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Última interacción:</span>
                  <span className="info-value">
                    {new Date(cliente.ultimaInteraccion).toLocaleDateString('es-CO', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Productos de interés */}
          {cliente.productosInteres && (
            <div className="productos-section">
              <div className="section-header">
                <span className="section-icon">📦</span>
                <h3 className="section-title">Productos de Interés</h3>
              </div>
              <div className="productos-content">
                <p className="productos-text">{cliente.productosInteres}</p>
              </div>
            </div>
          )}

          {/* Pedidos del cliente */}
          {pedidos.length > 0 && (
            <div className="pedidos-section">
              <div className="section-header">
                <span className="section-icon">🛒</span>
                <h3 className="section-title">Pedidos ({pedidos.length})</h3>
              </div>
              <div className="pedidos-list">
                {pedidos.slice(0, 5).map((pedido) => (
                  <div key={pedido._id} className="pedido-item">
                    <div className="pedido-info">
                      <strong>{pedido.idPedido}</strong>
                      <span className={`badge badge-${pedido.estado}`}>
                        {pedido.estado.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="pedido-monto">
                      ${pedido.total.toLocaleString('es-CO')}
                    </div>
                    <div className="pedido-fecha">
                      {new Date(pedido.fechaPedido).toLocaleDateString('es-CO')}
                    </div>
                  </div>
                ))}
                {pedidos.length > 5 && (
                  <div className="more-pedidos">
                    +{pedidos.length - 5} pedidos más
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="stats-row-cliente">
            <div className="stat-card-cliente">
              <div className="stat-icon">💬</div>
              <div className="stat-info">
                <span className="stat-value">{cliente.conversaciones || 0}</span>
                <span className="stat-label">Conversaciones</span>
              </div>
            </div>
            <div className="stat-card-cliente">
              <div className="stat-icon">🛒</div>
              <div className="stat-info">
                <span className="stat-value">{pedidos.length}</span>
                <span className="stat-label">Pedidos</span>
              </div>
            </div>
            <div className="stat-card-cliente">
              <div className="stat-icon">🔖</div>
              <div className="stat-info">
                <span className="stat-value">{cliente._id.substring(0, 8)}...</span>
                <span className="stat-label">ID Cliente</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
