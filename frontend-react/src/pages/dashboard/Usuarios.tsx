import { useState, useEffect } from 'react';
import { usuariosService } from '../../services/usuarios.service';
import type { Usuario } from '../../types';
import '../dashboard/Clientes.css';

export function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      const data = await usuariosService.getAll();
      setUsuarios(data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="loading">Cargando usuarios...</div>;

  return (
    <div className="clientes-page">
      <div className="page-header">
        <h2>Gestión de Usuarios</h2>
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-value">{usuarios.length}</div>
            <div className="stat-label">Total Usuarios</div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Tipo Operador</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 ? (
              <tr><td colSpan={5} className="no-data">No hay usuarios</td></tr>
            ) : (
              usuarios.map((usuario) => (
                <tr key={usuario._id}>
                  <td>{usuario.nombre}</td>
                  <td>{usuario.email}</td>
                  <td>
                    <span className={`badge badge-${usuario.rol}`}>
                      {usuario.rol}
                    </span>
                  </td>
                  <td>{usuario.tipoOperador || 'N/A'}</td>
                  <td>
                    <span className={`badge badge-${usuario.activo ? 'activo' : 'inactivo'}`}>
                      {usuario.activo ? 'Activo' : 'Inactivo'}
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
