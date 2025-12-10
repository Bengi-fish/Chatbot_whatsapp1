import { useState, useEffect } from 'react';
import { pedidosService } from '../../services/pedidos.service';
import { PedidoDetalle } from '../../components/PedidoDetalle';
import type { Pedido } from '../../types';
import '../dashboard/Clientes.css';

type EstadoPedido = 'todos' | 'pendiente' | 'en_proceso' | 'atendido' | 'cancelado';

export function Pedidos() {
  const [todosPedidos, setTodosPedidos] = useState<Pedido[]>([]);
  const [pedidosFiltrados, setPedidosFiltrados] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoPedido>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<string | null>(null);

  // Estadísticas
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    enProceso: 0,
    atendidos: 0,
    cancelados: 0
  });

  useEffect(() => {
    loadPedidos();
    
    // Auto-refresh cada 30 segundos
    const interval = setInterval(loadPedidos, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filtrarPedidos();
  }, [estadoFiltro, searchTerm, todosPedidos]);

  const loadPedidos = async () => {
    try {
      console.log('🔄 Cargando pedidos...');
      const data = await pedidosService.getAll();
      console.log('✅ Pedidos cargados:', data.length);
      
      setTodosPedidos(data);
      calcularEstadisticas(data);
    } catch (error) {
      console.error('❌ Error al cargar pedidos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calcularEstadisticas = (pedidos: Pedido[]) => {
    const total = pedidos.length;
    const pendientes = pedidos.filter(p => p.estado === 'pendiente').length;
    const enProceso = pedidos.filter(p => p.estado === 'en_proceso').length;
    const atendidos = pedidos.filter(p => p.estado === 'atendido').length;
    const cancelados = pedidos.filter(p => p.estado === 'cancelado').length;

    setStats({
      total,
      pendientes,
      enProceso,
      atendidos,
      cancelados
    });
  };

  const filtrarPedidos = () => {
    let filtered = [...todosPedidos];

    // Filtrar por estado
    if (estadoFiltro !== 'todos') {
      filtered = filtered.filter(p => p.estado === estadoFiltro);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        (p.idPedido || '').toLowerCase().includes(term) ||
        (p.nombreNegocio || '').toLowerCase().includes(term) ||
        (p.personaContacto || '').toLowerCase().includes(term) ||
        p.productos.some(prod => prod.nombre.toLowerCase().includes(term))
      );
    }

    setPedidosFiltrados(filtered);
  };

  const handleEstadoChange = (estado: EstadoPedido) => {
    setEstadoFiltro(estado);
  };

  const handlePedidoClick = (pedidoId: string) => {
    setPedidoSeleccionado(pedidoId);
  };

  const handleCloseModal = () => {
    setPedidoSeleccionado(null);
  };

  const handlePedidoUpdate = () => {
    loadPedidos();
  };

  const formatProductos = (productos: any[]) => {
    if (!Array.isArray(productos)) return productos;
    return productos.map(p => `${p.cantidad}x ${p.nombre}`).join(', ');
  };

  const getEstadoBadgeClass = (estado: string) => {
    const classes: Record<string, string> = {
      'pendiente': 'badge-warning',
      'en_proceso': 'badge-info',
      'atendido': 'badge-success',
      'cancelado': 'badge-danger'
    };
    return classes[estado] || 'badge-secondary';
  };

  const getEstadoTexto = (estado: string) => {
    const textos: Record<string, string> = {
      'pendiente': 'PENDIENTE',
      'en_proceso': 'EN PROCESO',
      'atendido': 'ATENDIDO',
      'cancelado': 'CANCELADO'
    };
    return textos[estado] || estado.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">⏳</div>
        <p>Cargando pedidos...</p>
      </div>
    );
  }

  return (
    <div className="clientes-page">
      {/* Header con título y búsqueda */}
      <div className="page-header">
        <h2>Gestión de Pedidos</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="🔍 Buscar por ID, cliente o productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Estadísticas con filtros */}
      <div className="stats-row">
        <div 
          className={`stat-card ${estadoFiltro === 'todos' ? 'active' : ''}`}
          onClick={() => handleEstadoChange('todos')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Pedidos</div>
        </div>

        <div 
          className={`stat-card ${estadoFiltro === 'pendiente' ? 'active' : ''}`}
          onClick={() => handleEstadoChange('pendiente')}
          style={{ cursor: 'pointer', borderLeft: '4px solid #f59e0b' }}
        >
          <div className="stat-value">{stats.pendientes}</div>
          <div className="stat-label">Pendientes</div>
        </div>

        <div 
          className={`stat-card ${estadoFiltro === 'en_proceso' ? 'active' : ''}`}
          onClick={() => handleEstadoChange('en_proceso')}
          style={{ cursor: 'pointer', borderLeft: '4px solid #3b82f6' }}
        >
          <div className="stat-value">{stats.enProceso}</div>
          <div className="stat-label">En Proceso</div>
        </div>

        <div 
          className={`stat-card ${estadoFiltro === 'atendido' ? 'active' : ''}`}
          onClick={() => handleEstadoChange('atendido')}
          style={{ cursor: 'pointer', borderLeft: '4px solid #22c55e' }}
        >
          <div className="stat-value">{stats.atendidos}</div>
          <div className="stat-label">Atendidos</div>
        </div>

        <div 
          className={`stat-card ${estadoFiltro === 'cancelado' ? 'active' : ''}`}
          onClick={() => handleEstadoChange('cancelado')}
          style={{ cursor: 'pointer', borderLeft: '4px solid #ef4444' }}
        >
          <div className="stat-value">{stats.cancelados}</div>
          <div className="stat-label">Cancelados</div>
        </div>
      </div>

      {/* Tabla de pedidos */}
      <div className="table-container">
        {pedidosFiltrados.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <p>
              {searchTerm 
                ? 'No se encontraron pedidos con los criterios de búsqueda' 
                : estadoFiltro === 'todos'
                  ? 'No hay pedidos registrados'
                  : `No hay pedidos ${getEstadoTexto(estadoFiltro).toLowerCase()}`
              }
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID Pedido</th>
                <th>Cliente</th>
                <th>Productos</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map((pedido) => (
                <tr 
                  key={pedido._id} 
                  className="clickable-row"
                  onClick={() => handlePedidoClick(pedido._id)}
                  style={{ cursor: 'pointer' }}
                >
                  <td><strong>{pedido.idPedido || 'N/A'}</strong></td>
                  <td>{pedido.nombreNegocio || pedido.personaContacto || '-'}</td>
                  <td style={{ maxWidth: '350px', whiteSpace: 'normal' }}>
                    {formatProductos(pedido.productos)}
                  </td>
                  <td><strong>${(pedido.total || 0).toLocaleString('es-CO')}</strong></td>
                  <td>
                    <span className={`badge ${getEstadoBadgeClass(pedido.estado)}`}>
                      {getEstadoTexto(pedido.estado)}
                    </span>
                  </td>
                  <td>{new Date(pedido.fechaPedido).toLocaleDateString('es-CO')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de detalle */}
      {pedidoSeleccionado && (
        <PedidoDetalle
          pedidoId={pedidoSeleccionado}
          onClose={handleCloseModal}
          onUpdate={handlePedidoUpdate}
        />
      )}
    </div>
  );
}

