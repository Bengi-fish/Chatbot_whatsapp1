import { useState, useEffect } from 'react';
import { clientesService } from '../../services/clientes.service';
import { ClienteDetalle } from '../../components/ClienteDetalle';
import type { Cliente, TipoCliente } from '../../types';
import './Clientes.css';

type FiltroTipo = 'todos' | 'hogar' | 'negocio' | 'hoy';

export function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FiltroTipo>('todos');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string | null>(null);

  useEffect(() => {
    loadClientes();
    
    // Auto-refresh cada 30 segundos
    const interval = setInterval(loadClientes, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterClientes();
  }, [clientes, searchTerm, filterType]);

  const loadClientes = async () => {
    try {
      setIsLoading(true);
      const data = await clientesService.getAll();
      setClientes(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar clientes');
    } finally {
      setIsLoading(false);
    }
  };

  const filterClientes = () => {
    let filtered = [...clientes];

    // Filtrar por tipo
    if (filterType === 'hogar') {
      filtered = filtered.filter(c => c.tipoCliente === 'hogar');
    } else if (filterType === 'negocio') {
      filtered = filtered.filter(c => c.tipoCliente !== 'hogar');
    } else if (filterType === 'hoy') {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      filtered = filtered.filter(c => {
        const fechaRegistro = new Date(c.fechaRegistro);
        fechaRegistro.setHours(0, 0, 0, 0);
        return fechaRegistro.getTime() === hoy.getTime();
      });
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.telefono.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.nombreNegocio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.ciudad?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredClientes(filtered);
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-CO');
  };

  const getResponsableLabel = (responsable?: string) => {
    const responsableMap: Record<string, string> = {
      'coordinador_masivos': 'Coord. Masivos',
      'director_comercial': 'Dir. Comercial',
      'ejecutivo_horecas': 'Ejec. Horecas',
      'mayorista': 'Mayorista'
    };
    return responsable ? responsableMap[responsable] || responsable : '-';
  };

  const getTipoLabel = (tipo: TipoCliente) => {
    return tipo.replace(/_/g, ' ').toUpperCase();
  };

  const clientesHogar = clientes.filter(c => c.tipoCliente === 'hogar').length;
  const clientesNegocio = clientes.filter(c => c.tipoCliente !== 'hogar').length;
  const clientesHoy = clientes.filter(c => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaRegistro = new Date(c.fechaRegistro);
    fechaRegistro.setHours(0, 0, 0, 0);
    return fechaRegistro.getTime() === hoy.getTime();
  }).length;

  if (isLoading) {
    return <div className="loading">Cargando clientes...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="clientes-page">
      <div className="page-header">
        <h2>Gestión de Clientes</h2>
        <div className="stats-row">
          <div 
            className={`stat-card ${filterType === 'todos' ? 'active' : ''}`}
            onClick={() => setFilterType('todos')}
            style={{ cursor: 'pointer' }}
          >
            <div className="stat-value">{clientes.length}</div>
            <div className="stat-label">Total Clientes</div>
          </div>
          <div 
            className={`stat-card ${filterType === 'hogar' ? 'active' : ''}`}
            onClick={() => setFilterType('hogar')}
            style={{ cursor: 'pointer' }}
          >
            <div className="stat-value">{clientesHogar}</div>
            <div className="stat-label">Hogar</div>
          </div>
          <div 
            className={`stat-card ${filterType === 'negocio' ? 'active' : ''}`}
            onClick={() => setFilterType('negocio')}
            style={{ cursor: 'pointer' }}
          >
            <div className="stat-value">{clientesNegocio}</div>
            <div className="stat-label">Negocios</div>
          </div>
          <div 
            className={`stat-card ${filterType === 'hoy' ? 'active' : ''}`}
            onClick={() => setFilterType('hoy')}
            style={{ cursor: 'pointer' }}
          >
            <div className="stat-value">{clientesHoy}</div>
            <div className="stat-label">Hoy</div>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <input
          type="text"
          placeholder="Buscar por teléfono, nombre, negocio o ciudad..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Teléfono</th>
              <th>Tipo</th>
              <th>Nombre Negocio</th>
              <th>Ciudad</th>
              <th>Responsable</th>
              <th>Conversaciones</th>
              <th>Fecha Registro</th>
            </tr>
          </thead>
          <tbody>
            {filteredClientes.length === 0 ? (
              <tr>
                <td colSpan={7} className="no-data">
                  No se encontraron clientes
                </td>
              </tr>
            ) : (
              filteredClientes.map((cliente) => (
                <tr 
                  key={cliente._id} 
                  className="clickable-row"
                  onClick={() => setClienteSeleccionado(cliente.telefono)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>{cliente.telefono}</td>
                  <td>
                    <span className={`badge badge-${cliente.tipoCliente}`}>
                      {getTipoLabel(cliente.tipoCliente)}
                    </span>
                  </td>
                  <td>{cliente.nombreNegocio || cliente.nombre || '-'}</td>
                  <td>{cliente.ciudad || '-'}</td>
                  <td>
                    <span className="badge badge-info">
                      {getResponsableLabel(cliente.responsable)}
                    </span>
                  </td>
                  <td className="text-center">{cliente.conversaciones || 0}</td>
                  <td>{formatDate(cliente.fechaRegistro)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de detalle */}
      {clienteSeleccionado && (
        <ClienteDetalle
          telefono={clienteSeleccionado}
          onClose={() => setClienteSeleccionado(null)}
        />
      )}
    </div>
  );
}
