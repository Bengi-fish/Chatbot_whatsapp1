import { useState, useEffect } from 'react';
import { clientesService } from '../../services/clientes.service';
import type { Cliente } from '../../types';
import './Clientes.css';

export function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'todos' | 'activos' | 'inactivos'>('todos');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadClientes();
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
    if (filterType === 'activos') {
      filtered = filtered.filter(c => c.estado === 'activo');
    } else if (filterType === 'inactivos') {
      filtered = filtered.filter(c => c.estado === 'inactivo');
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredClientes(filtered);
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-ES');
  };

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
          <div className="stat-card">
            <div className="stat-value">{clientes.length}</div>
            <div className="stat-label">Total Clientes</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {clientes.filter(c => c.estado === 'activo').length}
            </div>
            <div className="stat-label">Activos</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {clientes.filter(c => c.estado === 'inactivo').length}
            </div>
            <div className="stat-label">Inactivos</div>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <input
          type="text"
          placeholder="Buscar por número, nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <div className="filter-buttons">
          <button
            className={filterType === 'todos' ? 'active' : ''}
            onClick={() => setFilterType('todos')}
          >
            Todos ({clientes.length})
          </button>
          <button
            className={filterType === 'activos' ? 'active' : ''}
            onClick={() => setFilterType('activos')}
          >
            Activos ({clientes.filter(c => c.estado === 'activo').length})
          </button>
          <button
            className={filterType === 'inactivos' ? 'active' : ''}
            onClick={() => setFilterType('inactivos')}
          >
            Inactivos ({clientes.filter(c => c.estado === 'inactivo').length})
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Conversaciones</th>
              <th>Pedidos</th>
              <th>Última Interacción</th>
              <th>Estado</th>
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
                <tr key={cliente._id}>
                  <td>{cliente.numero}</td>
                  <td>{cliente.nombre || 'Sin nombre'}</td>
                  <td>{cliente.email || 'Sin email'}</td>
                  <td className="text-center">{cliente.conversaciones || 0}</td>
                  <td className="text-center">{cliente.pedidos || 0}</td>
                  <td>{formatDate(cliente.ultimaInteraccion)}</td>
                  <td>
                    <span className={`badge badge-${cliente.estado}`}>
                      {cliente.estado}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
