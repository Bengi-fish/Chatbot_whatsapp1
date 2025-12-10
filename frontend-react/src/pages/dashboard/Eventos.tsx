import { useState, useEffect } from 'react';
import { eventosService } from '../../services/eventos.service';
import type { Evento } from '../../types';
import '../dashboard/Clientes.css';

export function Eventos() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEventos();
  }, []);

  const loadEventos = async () => {
    try {
      const data = await eventosService.getAll();
      setEventos(data);
    } catch (error) {
      console.error('Error al cargar eventos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="loading">Cargando eventos...</div>;

  return (
    <div className="clientes-page">
      <div className="page-header">
        <h2>Registro de Eventos</h2>
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-value">{eventos.length}</div>
            <div className="stat-label">Total Eventos</div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Categoría</th>
              <th>Mensaje</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {eventos.length === 0 ? (
              <tr><td colSpan={4} className="no-data">No hay eventos</td></tr>
            ) : (
              eventos.map((evento) => (
                <tr key={evento._id}>
                  <td>
                    <span className={`badge badge-${evento.tipo}`}>
                      {evento.tipo}
                    </span>
                  </td>
                  <td>{evento.categoria}</td>
                  <td>{evento.mensaje}</td>
                  <td>{new Date(evento.timestamp).toLocaleString('es-ES')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
