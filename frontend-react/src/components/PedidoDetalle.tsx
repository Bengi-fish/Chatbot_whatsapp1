import { useState, useEffect } from 'react';
import type { Pedido } from '../types';
import { pedidosService } from '../services/pedidos.service';
import { useAuth } from '../contexts/AuthContext';
import './PedidoDetalle.css';

interface PedidoDetalleProps {
  pedidoId: string;
  onClose: () => void;
  onUpdate: () => void;
}

const TIPO_OPERADOR_TEXTO: Record<string, string> = {
  'coordinador_masivos': 'Coordinador de Masivos',
  'director_comercial': 'Director Comercial',
  'ejecutivo_horecas': 'Ejecutivo de Horecas',
  'mayorista': 'Asesor de Mayoristas'
};

const ESTADO_MAP: Record<string, { icon: string; color: string; label: string }> = {
  'pendiente': { icon: '⏳', color: '#f59e0b', label: 'Pendiente' },
  'en_proceso': { icon: '🔄', color: '#3b82f6', label: 'En Proceso' },
  'atendido': { icon: '✅', color: '#22c55e', label: 'Atendido' },
  'cancelado': { icon: '❌', color: '#ef4444', label: 'Cancelado' }
};

export function PedidoDetalle({ pedidoId, onClose, onUpdate }: PedidoDetalleProps) {
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadPedido();
  }, [pedidoId]);

  const loadPedido = async () => {
    try {
      const data = await pedidosService.getById(pedidoId);
      setPedido(data);
      
      // Generar mensaje para el cliente
      if (data) {
        const nombreOperador = TIPO_OPERADOR_TEXTO[user?.tipoOperador || ''] || 'Asesor Comercial';
        const productosTexto = data.productos.map(p => 
          `- ${p.cantidad} ${p.nombre} ($${p.precioUnitario.toLocaleString('es-CO')} c/u)`
        ).join('\n');
        
        const mensajeInicial = `Hola, soy tu asesor de Avellano, más específicamente ${nombreOperador}. Yo seré el encargado de que tu pedido con ID *${data.idPedido}* sea entregado correctamente.

📍 *Dirección de entrega:* ${data.direccion || 'No especificada'}, ${data.ciudad || ''}

📦 *Tu pedido consta de:*
${productosTexto}

💰 *Total: $${data.total.toLocaleString('es-CO')}*

En breve me pondré en contacto contigo para confirmar los detalles y coordinar la entrega. ¡Gracias por tu preferencia! 🐓`;
        
        setMensaje(mensajeInicial);
      }
    } catch (error) {
      console.error('Error cargando pedido:', error);
      alert('❌ Error cargando el pedido');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleTomarPedido = async () => {
    if (!pedido) return;
    
    if (!confirm('¿Deseas tomar este pedido? Se cambiará el estado a "En Proceso" y se notificará al cliente por WhatsApp')) {
      return;
    }

    try {
      await pedidosService.tomarPedido(pedido._id);
      
      // Enviar mensaje de WhatsApp
      try {
        await pedidosService.enviarMensajeWhatsApp(
          pedido.telefono,
          'Su pedido ya está siendo atendido por un asesor comercial. En breve se comunicará con usted para confirmar el pedido y realizar el pago del mismo. ¡Gracias por su preferencia! 🐓'
        );
        alert('✅ Pedido tomado exitosamente y cliente notificado por WhatsApp');
      } catch (whatsappError) {
        console.error('Error enviando WhatsApp:', whatsappError);
        alert('✅ Pedido tomado exitosamente. ⚠️ No se pudo enviar notificación por WhatsApp');
      }
      
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error tomando pedido:', error);
      alert('❌ Error al tomar el pedido');
    }
  };

  const handleCompletarPedido = async () => {
    if (!pedido) return;
    
    if (!confirm('¿Marcar este pedido como ATENDIDO?')) {
      return;
    }

    try {
      await pedidosService.completarPedido(pedido._id);
      alert('✅ Pedido marcado como atendido');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error completando pedido:', error);
      alert('❌ Error al completar el pedido');
    }
  };

  const handleCancelarPedido = async () => {
    if (!pedido) return;
    
    const motivo = prompt('¿Por qué deseas cancelar este pedido?');
    if (!motivo) return;

    try {
      await pedidosService.cancelarPedido(pedido._id, motivo);
      alert('✅ Pedido cancelado');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error cancelando pedido:', error);
      alert('❌ Error al cancelar el pedido');
    }
  };

  const handleCopiarMensaje = () => {
    navigator.clipboard.writeText(mensaje)
      .then(() => {
        alert('✅ Mensaje copiado al portapapeles');
      })
      .catch(() => {
        alert('❌ No se pudo copiar el mensaje');
      });
  };

  const handleAbrirWhatsApp = () => {
    if (!pedido) return;
    
    const mensajeEncoded = encodeURIComponent(mensaje);
    const telefonoLimpio = pedido.telefono.replace(/\D/g, '');
    const whatsappLink = `https://wa.me/${telefonoLimpio}?text=${mensajeEncoded}`;
    window.open(whatsappLink, '_blank');
  };

  if (isLoading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content-pedido" onClick={(e) => e.stopPropagation()}>
          <div className="loading">Cargando pedido...</div>
        </div>
      </div>
    );
  }

  if (!pedido) return null;

  const estadoInfo = ESTADO_MAP[pedido.estado] || { icon: '❓', color: '#999', label: pedido.estado };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-pedido" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-pedido">
          <div className="pedido-header-content">
            <h2 className="pedido-id">{pedido.idPedido}</h2>
            <span className={`badge badge-${pedido.estado} badge-large`}>
              {estadoInfo.icon} {estadoInfo.label.toUpperCase()}
            </span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body-pedido">
          <div className="pedido-fecha">
            📅 {new Date(pedido.fechaPedido).toLocaleString('es-CO', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>

          {/* Información del Cliente */}
          <div className="pedido-section">
            <h3 className="section-title">👤 Información del Cliente</h3>
            <div className="info-grid-pedido">
              <div className="info-item">
                <span className="info-label">Negocio:</span>
                <span className="info-value">{pedido.nombreNegocio || 'No especificado'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Persona de Contacto:</span>
                <span className="info-value">{pedido.personaContacto || 'No especificado'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Teléfono:</span>
                <span className="info-value">{pedido.telefono}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Tipo:</span>
                <span className="info-value">{pedido.tipoCliente?.replace(/_/g, ' ').toUpperCase()}</span>
              </div>
              <div className="info-item full-width">
                <span className="info-label">📍 Dirección:</span>
                <span className="info-value">{pedido.direccion || 'No especificada'}, {pedido.ciudad || ''}</span>
              </div>
            </div>
          </div>

          {/* Productos */}
          <div className="pedido-section">
            <h3 className="section-title">📦 Productos del Pedido</h3>
            <table className="productos-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio Unit.</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {pedido.productos.map((producto, index) => (
                  <tr key={index}>
                    <td><strong>{producto.nombre}</strong></td>
                    <td className="text-center">{producto.cantidad}</td>
                    <td className="text-right">${producto.precioUnitario.toLocaleString('es-CO')}</td>
                    <td className="text-right"><strong>${producto.subtotal.toLocaleString('es-CO')}</strong></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="total-row">
                  <td colSpan={3}><strong>TOTAL</strong></td>
                  <td className="text-right"><strong className="total-price">${pedido.total.toLocaleString('es-CO')}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Coordinador Asignado */}
          {pedido.coordinadorAsignado && (
            <div className="pedido-section">
              <h3 className="section-title">👨‍💼 Coordinador Asignado</h3>
              <div className="coordinador-info">
                <div className="coordinador-nombre">{pedido.coordinadorAsignado}</div>
                <div className="coordinador-tel">📞 {pedido.telefonoCoordinador}</div>
              </div>
            </div>
          )}

          {/* Historial de Estados */}
          {pedido.historialEstados && pedido.historialEstados.length > 0 && (
            <div className="pedido-section">
              <h3 className="section-title">📊 Historial de Estados</h3>
              <div className="timeline">
                {pedido.historialEstados.map((cambio, index) => {
                  const estadoCambio = ESTADO_MAP[cambio.estado];
                  const isLast = index === pedido.historialEstados!.length - 1;
                  
                  return (
                    <div key={index} className={`timeline-item ${isLast ? 'current' : ''}`}>
                      <div className="timeline-marker" style={{ background: estadoCambio.color }}>
                        {estadoCambio.icon}
                      </div>
                      <div className="timeline-content">
                        <div className="timeline-title" style={{ color: estadoCambio.color }}>
                          {estadoCambio.label}
                        </div>
                        <div className="timeline-date">
                          📅 {new Date(cambio.fecha).toLocaleString('es-CO', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        {cambio.operadorEmail && (
                          <div className="timeline-operator">
                            👤 {cambio.operadorEmail}
                          </div>
                        )}
                        {cambio.nota && (
                          <div className="timeline-note">
                            💬 {cambio.nota}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notas */}
          {pedido.notas && (
            <div className="pedido-section">
              <h3 className="section-title">📝 Notas</h3>
              <div className="pedido-notas">{pedido.notas}</div>
            </div>
          )}

          {/* Motivo de Cancelación */}
          {pedido.estado === 'cancelado' && pedido.notasCancelacion && (
            <div className="pedido-section cancelacion">
              <h3 className="section-title">❌ Motivo de Cancelación</h3>
              <div className="pedido-notas">{pedido.notasCancelacion}</div>
            </div>
          )}

          {/* Mensaje para el Cliente (solo si está en proceso) */}
          {pedido.estado === 'en_proceso' && (
            <div className="pedido-section mensaje-cliente-section">
              <h3 className="section-title">💬 Mensaje para el Cliente</h3>
              <div className="mensaje-container">
                <textarea
                  className="mensaje-textarea"
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                />
                <div className="mensaje-botones">
                  <button className="btn-copiar" onClick={handleCopiarMensaje}>
                    📋 Copiar Mensaje
                  </button>
                  <button className="btn-whatsapp" onClick={handleAbrirWhatsApp}>
                    💬 Abrir en WhatsApp
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botones de Acción */}
        <div className="modal-footer-pedido">
          {pedido.estado === 'pendiente' && (
            <button className="btn-tomar-pedido" onClick={handleTomarPedido}>
              📦 Tomar Pedido
            </button>
          )}
          
          {pedido.estado === 'en_proceso' && (
            <>
              <button className="btn-completar" onClick={handleCompletarPedido}>
                ✅ Marcar como Atendido
              </button>
              <button className="btn-cancelar" onClick={handleCancelarPedido}>
                ❌ Cancelar Pedido
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
