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
        <div className="header-content">
          <div className="header-text">
            <h2>Gestión de Pedidos</h2>
            <p className="page-subtitle">Administra y monitorea todos los pedidos</p>
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
          placeholder="Buscar por ID, cliente o productos..."
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
            <svg className="empty-state-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 16V8C20.9996 7.64927 20.9071 7.30481 20.7315 7.00116C20.556 6.69751 20.3037 6.44536 20 6.27L13 2.27C12.696 2.09446 12.3511 2.00205 12 2.00205C11.6489 2.00205 11.304 2.09446 11 2.27L4 6.27C3.69626 6.44536 3.44398 6.69751 3.26846 7.00116C3.09294 7.30481 3.00036 7.64927 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9988C3.44398 17.3025 3.69626 17.5546 4 17.73L11 21.73C11.304 21.9055 11.6489 21.9979 12 21.9979C12.3511 21.9979 12.696 21.9055 13 21.73L20 17.73C20.3037 17.5546 20.556 17.3025 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3.27 6.96L12 12.01L20.73 6.96M12 22.08V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
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

