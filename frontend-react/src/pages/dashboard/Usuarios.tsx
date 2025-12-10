import { useState, useEffect } from 'react';
import { usuariosService } from '../../services/usuarios.service';
import type { Usuario, UserRole, TipoOperador } from '../../types';
import '../dashboard/Clientes.css';
import './Usuarios.css';

export function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'operador' as UserRole,
    tipoOperador: undefined as TipoOperador | undefined
  });

  useEffect(() => {
    loadUsuarios();
    
    // Auto-refresh cada 30 segundos
    const interval = setInterval(loadUsuarios, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadUsuarios = async () => {
    try {
      const data = await usuariosService.getAll();
      setUsuarios(data);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const cambiarRol = async (userId: string, newRole: string) => {
    const roleMap: Record<string, { rol: UserRole; tipoOperador: TipoOperador | undefined }> = {
      'administrador': { rol: 'administrador', tipoOperador: undefined },
      'soporte': { rol: 'soporte', tipoOperador: undefined },
      'mayorista': { rol: 'operador', tipoOperador: 'mayorista' },
      'director_comercial': { rol: 'operador', tipoOperador: 'director_comercial' },
      'coordinador_masivos': { rol: 'operador', tipoOperador: 'coordinador_masivos' },
      'ejecutivo_horecas': { rol: 'operador', tipoOperador: 'ejecutivo_horecas' },
      'hogares': { rol: 'hogares', tipoOperador: undefined }
    };

    const roleConfig = roleMap[newRole];
    if (!roleConfig) {
      alert('❌ Rol no válido');
      loadUsuarios();
      return;
    }

    const rolTexto: Record<string, string> = {
      'administrador': 'Administrador',
      'soporte': 'Soporte',
      'mayorista': 'Mayorista',
      'director_comercial': 'Director Comercial',
      'coordinador_masivos': 'Coordinador de Masivos',
      'ejecutivo_horecas': 'Ejecutivo Horecas',
      'hogares': 'Hogares'
    };

    if (!confirm(`¿Estás seguro de cambiar el rol de este usuario a ${rolTexto[newRole]}?`)) {
      loadUsuarios();
      return;
    }

    try {
      await usuariosService.cambiarRol(userId, roleConfig.rol, roleConfig.tipoOperador);
      alert(`✅ Rol actualizado exitosamente a ${rolTexto[newRole]}`);
      loadUsuarios();
    } catch (error) {
      console.error('Error actualizando rol:', error);
      alert('❌ Error de conexión');
      loadUsuarios();
    }
  };

  const toggleEstado = async (userId: string, nuevoEstado: boolean) => {
    if (!confirm(`¿Estás seguro de ${nuevoEstado ? 'activar' : 'desactivar'} este usuario?`)) {
      return;
    }

    try {
      await usuariosService.toggleStatus(userId, nuevoEstado);
      alert(`✅ Usuario ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`);
      loadUsuarios();
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      alert('❌ Error de conexión');
    }
  };

  const eliminarUsuario = async (userId: string, email: string) => {
    if (!confirm(`⚠️ ¿Estás seguro de ELIMINAR permanentemente al usuario ${email}?\n\nEsta acción NO se puede deshacer.`)) {
      return;
    }

    try {
      await usuariosService.delete(userId);
      alert('✅ Usuario eliminado exitosamente');
      loadUsuarios();
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      alert('❌ Error de conexión');
    }
  };

  const crearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!nuevoUsuario.nombre.trim() || !nuevoUsuario.email.trim() || !nuevoUsuario.password.trim()) {
      alert('❌ Por favor completa todos los campos obligatorios');
      return;
    }

    if (nuevoUsuario.password.length < 6) {
      alert('❌ La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (nuevoUsuario.rol === 'operador' && !nuevoUsuario.tipoOperador) {
      alert('❌ Debes seleccionar un tipo de operador');
      return;
    }

    try {
      await usuariosService.create(nuevoUsuario);
      alert('✅ Usuario creado exitosamente');
      setShowModal(false);
      setNuevoUsuario({
        nombre: '',
        email: '',
        password: '',
        rol: 'operador',
        tipoOperador: undefined
      });
      loadUsuarios();
    } catch (error: any) {
      console.error('Error creando usuario:', error);
      alert(`❌ Error: ${error.response?.data?.error || error.message || 'Error al crear usuario'}`);
    }
  };

  const handleRolChange = (rol: UserRole) => {
    setNuevoUsuario({
      ...nuevoUsuario,
      rol,
      tipoOperador: rol === 'operador' ? 'mayorista' : undefined
    });
  };

  const usuariosFiltrados = usuarios.filter(user =>
    user.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div className="loading">Cargando usuarios...</div>;

  return (
    <div className="clientes-page usuarios-page">
      <div className="page-header">
        <h2>👥 Gestión de Usuarios</h2>
        <button className="btn-create" onClick={() => setShowModal(true)}>
          + Agregar Usuario
        </button>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="🔍 Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{usuarios.length}</div>
          <div className="stat-label">Total Usuarios</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{usuarios.filter(u => u.activo).length}</div>
          <div className="stat-label">Activos</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{usuarios.filter(u => u.rol === 'administrador').length}</div>
          <div className="stat-label">Administradores</div>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Fecha Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.length === 0 ? (
              <tr><td colSpan={6} className="no-data">No hay usuarios</td></tr>
            ) : (
              usuariosFiltrados.map((user) => {
                // @ts-ignore - rolTexto is used in JSX below
                let rolTexto = '';
                let rolValue = '';
                if (user.rol === 'administrador') {
                  rolTexto = 'Administrador';
                  rolValue = 'administrador';
                } else if (user.rol === 'soporte') {
                  rolTexto = 'Soporte';
                  rolValue = 'soporte';
                } else if (user.rol === 'hogares') {
                  rolTexto = 'Hogares';
                  rolValue = 'hogares';
                } else if (user.rol === 'operador') {
                  const tipoMap: Record<string, string> = {
                    'mayorista': 'Mayorista',
                    'director_comercial': 'Director Comercial',
                    'coordinador_masivos': 'Coordinador de Masivos',
                    'ejecutivo_horecas': 'Ejecutivo Horecas'
                  };
                  rolTexto = tipoMap[user.tipoOperador || ''] || 'Operador';
                  rolValue = user.tipoOperador || 'operador';
                }

                return (
                  <tr key={user._id}>
                    <td>{user.nombre || '-'}</td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        className="rol-selector"
                        value={rolValue}
                        onChange={(e) => cambiarRol(user._id, e.target.value)}
                        disabled={user.rol === 'administrador'}
                      >
                        <option value="administrador">Administrador</option>
                        <option value="mayorista">Mayorista</option>
                        <option value="director_comercial">Director Comercial</option>
                        <option value="coordinador_masivos">Coordinador de Masivos</option>
                        <option value="ejecutivo_horecas">Ejecutivo Horecas</option>
                        <option value="hogares">Hogares</option>
                        <option value="soporte">Soporte</option>
                      </select>
                    </td>
                    <td>
                      <span className={`badge ${user.activo ? 'badge-success' : 'badge-danger'}`}>
                        {user.activo ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString('es-ES')}</td>
                    <td className="actions-cell">
                      <button
                        className={`btn-small ${user.activo ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => toggleEstado(user._id, !user.activo)}
                        disabled={user.rol === 'administrador'}
                      >
                        {user.activo ? '🚫' : '✅'}
                      </button>
                      <button
                        className="btn-small btn-danger"
                        onClick={() => eliminarUsuario(user._id, user.email)}
                        disabled={user.rol === 'administrador'}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de creación */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Agregar Nuevo Usuario</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={crearUsuario} className="usuario-form">
              <div className="form-group">
                <label>Nombre Completo *</label>
                <input
                  type="text"
                  value={nuevoUsuario.nombre}
                  onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })}
                  placeholder="Ej: Juan Pérez"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={nuevoUsuario.email}
                  onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })}
                  placeholder="usuario@avellano.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Contraseña *</label>
                <input
                  type="password"
                  value={nuevoUsuario.password}
                  onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  required
                />
              </div>

              <div className="form-group">
                <label>Rol *</label>
                <select
                  value={nuevoUsuario.rol}
                  onChange={(e) => handleRolChange(e.target.value as UserRole)}
                  required
                >
                  <option value="operador">Operador</option>
                  <option value="administrador">Administrador</option>
                  <option value="soporte">Soporte</option>
                </select>
              </div>

              {nuevoUsuario.rol === 'operador' && (
                <div className="form-group">
                  <label>Tipo de Operador *</label>
                  <select
                    value={nuevoUsuario.tipoOperador || ''}
                    onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, tipoOperador: e.target.value as TipoOperador })}
                    required
                  >
                    <option value="mayorista">Mayorista</option>
                    <option value="director_comercial">Director Comercial</option>
                    <option value="coordinador_masivos">Coordinador de Masivos</option>
                    <option value="ejecutivo_horecas">Ejecutivo Horecas</option>
                  </select>
                </div>
              )}

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  ✅ Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
