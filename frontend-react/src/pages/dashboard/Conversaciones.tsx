import { useState, useEffect } from 'react';
import { conversacionesService } from '../../services/conversaciones.service';
import type { Conversacion } from '../../types';
import '../dashboard/Clientes.css';

export function Conversaciones() {
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConversaciones();
  }, []);

  const loadConversaciones = async () => {
    try {
      const data = await conversacionesService.getAll();
      setConversaciones(data);
    } catch (error) {
      console.error('Error al cargar conversaciones:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="loading">Cargando conversaciones...</div>;

  return (
    <div className="clientes-page">
      <div className="page-header">
        <h2>Gestión de Conversaciones</h2>
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-value">{conversaciones.length}</div>
            <div className="stat-label">Total Conversaciones</div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Mensajes</th>
              <th>Estado</th>
              <th>Iniciada</th>
              <th>Último Mensaje</th>
            </tr>
          </thead>
          <tbody>
            {conversaciones.length === 0 ? (
              <tr><td colSpan={5} className="no-data">No hay conversaciones</td></tr>
            ) : (
              conversaciones.map((conv) => (
                <tr key={conv._id}>
                  <td>{conv.clienteNombre || conv.clienteNumero}</td>
                  <td>{conv.mensajes.length}</td>
                  <td>
                    <span className={`badge badge-${conv.estado}`}>
                      {conv.estado}
                    </span>
                  </td>
                  <td>{new Date(conv.iniciadaEn).toLocaleDateString('es-ES')}</td>
                  <td>{new Date(conv.ultimoMensaje).toLocaleDateString('es-ES')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
