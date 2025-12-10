import { useState, useEffect } from 'react';
import { pedidosService } from '../../services/pedidos.service';
import type { Pedido } from '../../types';
import '../dashboard/Clientes.css';

export function Pedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPedidos();
  }, []);

  const loadPedidos = async () => {
    try {
      const data = await pedidosService.getAll();
      setPedidos(data);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="loading">Cargando pedidos...</div>;

  return (
    <div className="clientes-page">
      <div className="page-header">
        <h2>Gestión de Pedidos</h2>
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-value">{pedidos.length}</div>
            <div className="stat-label">Total Pedidos</div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Productos</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Fecha Pedido</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.length === 0 ? (
              <tr><td colSpan={5} className="no-data">No hay pedidos</td></tr>
            ) : (
              pedidos.map((pedido) => (
                <tr key={pedido._id}>
                  <td>{pedido.clienteNombre || pedido.clienteNumero}</td>
                  <td>{pedido.productos.length} items</td>
                  <td>${pedido.total.toFixed(2)}</td>
                  <td>
                    <span className={`badge badge-${pedido.estado}`}>
                      {pedido.estado}
                    </span>
                  </td>
                  <td>{new Date(pedido.fechaPedido).toLocaleDateString('es-ES')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
