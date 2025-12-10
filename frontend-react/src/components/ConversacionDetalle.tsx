import { useState, useEffect } from 'react';
import type { Conversacion, Pedido } from '../types';
import { conversacionesService } from '../services/conversaciones.service';
import { pedidosService } from '../services/pedidos.service';
import './ConversacionDetalle.css';

interface ConversacionDetalleProps {
  telefono: string;
  onClose: () => void;
}

type SeccionActiva = 'pedidos' | 'registros' | 'contactos';

const ESTADO_MAP: Record<string, { icon: string; color: string; label: string }> = {
  'pendiente': { icon: '⏳', color: '#f59e0b', label: 'Pendiente' },
  'en_proceso': { icon: '🔄', color: '#3b82f6', label: 'En Proceso' },
  'atendido': { icon: '✅', color: '#22c55e', label: 'Atendido' },
  'cancelado': { icon: '❌', color: '#ef4444', label: 'Cancelado' }
};

export function ConversacionDetalle({ telefono, onClose }: ConversacionDetalleProps) {
  const [conversacion, setConversacion] = useState<Conversacion | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [seccionActiva, setSeccionActiva] = useState<SeccionActiva>('pedidos');
  const [pedidoExpandido, setPedidoExpandido] = useState<string | null>(null);

  useEffect(() => {
    loadConversacion();
    loadPedidos();
  }, [telefono]);

  const loadConversacion = async () => {
    try {
      const data = await conversacionesService.getByTelefono(telefono);
      setConversacion(data);
    } catch (error) {
      console.error('Error cargando conversación:', error);
      alert('❌ Error cargando conversación');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const loadPedidos = async () => {
    try {
      const data = await pedidosService.getByCliente(telefono);
      setPedidos(data);
    } catch (error) {
      console.error('Error cargando pedidos:', error);
    }
  };

  const togglePedido = (pedidoId: string) => {
    setPedidoExpandido(pedidoExpandido === pedidoId ? null : pedidoId);
  };

  if (isLoading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content-conversacion" onClick={(e) => e.stopPropagation()}>
          <div className="loading">Cargando conversación...</div>
        </div>
      </div>
    );
  }

  if (!conversacion) return null;

  const nombreDisplay = conversacion.nombreNegocio || conversacion.nombreCliente || telefono;
  const registros = conversacion.interaccionesImportantes?.filter(i => i.tipo === 'registro') || [];
  const contactos = conversacion.interaccionesImportantes?.filter(i => i.tipo === 'contacto_asesor') || [];
  const totalMensajes = conversacion.mensajes?.length || 0;
  const ultimaInteraccion = conversacion.fechaUltimoMensaje
    ? new Date(conversacion.fechaUltimoMensaje).toLocaleString('es-CO')
    : 'Sin registro';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-conversacion" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header-conversacion">
          <h2>Conversación con {nombreDisplay}</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body-conversacion">
          {/* Resumen de interacciones */}
          <div className="resumen-section">
            <h3>📊 Resumen de Interacciones</h3>
            <div className="tabs-row">
              <div
                className={`tab-card ${seccionActiva === 'pedidos' ? 'active' : ''}`}
                onClick={() => setSeccionActiva('pedidos')}
              >
                <div className="tab-value">{pedidos.length}</div>
                <div className="tab-label">Pedidos</div>
              </div>
              <div
                className={`tab-card ${seccionActiva === 'registros' ? 'active' : ''}`}
                onClick={() => setSeccionActiva('registros')}
              >
                <div className="tab-value">{registros.length}</div>
                <div className="tab-label">Registros</div>
              </div>
              <div
                className={`tab-card ${seccionActiva === 'contactos' ? 'active' : ''}`}
                onClick={() => setSeccionActiva('contactos')}
              >
                <div className="tab-value">{contactos.length}</div>
                <div className="tab-label">Contactos</div>
              </div>
            </div>
          </div>

          {/* Contenido de secciones */}
          <div className="seccion-contenido">
            {seccionActiva === 'pedidos' && (
              <div className="seccion-pedidos">
                <h4>📦 Historial de Pedidos</h4>
                {pedidos.length === 0 ? (
                  <div className="empty-state-small">
                    <div className="empty-icon">📦</div>
                    <p>No hay pedidos registrados para este cliente</p>
                  </div>
                ) : (
                  pedidos.map((pedido) => {
                    const estadoInfo = ESTADO_MAP[pedido.estado];
                    const isExpanded = pedidoExpandido === pedido._id;

                    return (
                      <div key={pedido._id} className="pedido-card">
                        <div
                          className="pedido-header"
                          onClick={() => togglePedido(pedido._id)}
                        >
                          <div className="pedido-header-info">
                            <strong>{pedido.idPedido}</strong>
                            <span
                              className="badge-small"
                              style={{ background: estadoInfo.color, color: 'white' }}
                            >
                              {estadoInfo.icon} {estadoInfo.label}
                            </span>
                          </div>
                          <div className="pedido-header-right">
                            <div className="pedido-total">
                              ${pedido.total.toLocaleString('es-CO')}
                            </div>
                            <div className="pedido-fecha">
                              {new Date(pedido.fechaPedido).toLocaleDateString('es-CO')}
                            </div>
                            <div className="expand-icon">{isExpanded ? '▲' : '▼'}</div>
                          </div>
                        </div>

                        {isExpanded && pedido.historialEstados && (
                          <div className="pedido-detalle-expanded">
                            <div className="timeline-mini">
                              {pedido.historialEstados.map((cambio, idx) => {
                                const est = ESTADO_MAP[cambio.estado];
                                return (
                                  <div key={idx} className="timeline-item-mini">
                                    <div
                                      className="timeline-marker-mini"
                                      style={{ background: est.color }}
                                    >
                                      {est.icon}
                                    </div>
                                    <div className="timeline-content-mini">
                                      <div style={{ color: est.color, fontWeight: 600 }}>
                                        {est.label}
                                      </div>
                                      <div className="timeline-date-mini">
                                        {new Date(cambio.fecha).toLocaleString('es-CO')}
                                      </div>
                                      {cambio.operadorEmail && (
                                        <div className="timeline-operator-mini">
                                          👤 {cambio.operadorEmail}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {seccionActiva === 'registros' && (
              <div className="seccion-registros">
                <h4>📝 Información de Registro</h4>
                <div className="info-box">
                  <div className="info-row-conv">
                    <div className="info-item-conv">
                      <div className="info-label-conv">📅 Fecha de Registro</div>
                      <div className="info-value-conv">
                        {conversacion.clienteInfo?.fechaRegistro
                          ? new Date(conversacion.clienteInfo.fechaRegistro).toLocaleString('es-CO')
                          : 'No disponible'}
                      </div>
                    </div>
                    <div className="info-item-conv">
                      <div className="info-label-conv">🕐 Última Interacción</div>
                      <div className="info-value-conv">{ultimaInteraccion}</div>
                    </div>
                  </div>
                  <div className="total-mensajes">
                    <div className="total-mensajes-label">💬 Total de Interacciones</div>
                    <div className="total-mensajes-value">{totalMensajes}</div>
                  </div>
                </div>

                {registros.length > 0 && (
                  <div className="eventos-list">
                    <strong>📋 Eventos de Registro:</strong>
                    {registros.map((registro, idx) => (
                      <div key={idx} className="evento-item registro">
                        <div className="evento-contenido">
                          {registro.contenido || 'Registro completado'}
                        </div>
                        <div className="evento-fecha">
                          {new Date(registro.timestamp).toLocaleString('es-CO')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {seccionActiva === 'contactos' && (
              <div className="seccion-contactos">
                <h4>📞 Solicitudes de Contacto</h4>
                {contactos.length === 0 ? (
                  <div className="empty-state-small">
                    <div className="empty-icon">📞</div>
                    <p>No hay solicitudes de contacto registradas</p>
                  </div>
                ) : (
                  <div className="eventos-list">
                    {contactos.map((contacto, idx) => (
                      <div key={idx} className="evento-item contacto">
                        <div className="evento-badge">📞 Contacto con Asesor</div>
                        <div className="evento-contenido">
                          {contacto.contenido || 'Solicitud de contacto'}
                        </div>
                        <div className="evento-fecha">
                          {new Date(contacto.timestamp).toLocaleString('es-CO')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Estadísticas adicionales */}
          <div className="estadisticas-adicionales">
            <h4>📈 Estadísticas de Interacción</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <strong>Total de mensajes:</strong> {totalMensajes}
              </div>
              <div className="stat-item">
                <strong>Última interacción:</strong> {ultimaInteraccion}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
