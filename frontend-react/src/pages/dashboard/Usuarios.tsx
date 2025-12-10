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
  const [modalTab, setModalTab] = useState<'individual' | 'csv'>('individual');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [selectedRoleType, setSelectedRoleType] = useState<string>('administrador');
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
      'encargado_hogares': { rol: 'hogares', tipoOperador: 'encargado_hogares' }
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
      'encargado_hogares': 'Encargado de Hogares'
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

  const handleCsvUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!csvFile) {
      alert('❌ Por favor selecciona un archivo CSV');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          alert('❌ El archivo CSV debe contener al menos el encabezado y una fila de datos');
          return;
        }

        // Skip header
        const dataLines = lines.slice(1);
        let successCount = 0;
        let errorCount = 0;
        const errors: string[] = [];

        for (const line of dataLines) {
          const [nombre, email, password, rolStr] = line.split(',').map(s => s.trim());
          
          if (!nombre || !email || !password || !rolStr) {
            errorCount++;
            errors.push(`Fila inválida: ${line}`);
            continue;
          }

          try {
            const { rol, tipoOperador } = getRoleConfig(rolStr);
            await usuariosService.create({
              nombre,
              email,
              password,
              rol,
              tipoOperador
            } as any);
            successCount++;
          } catch (error: any) {
            errorCount++;
            errors.push(`${email}: ${error.response?.data?.error || 'Error desconocido'}`);
          }
        }

        let message = `✅ Importación completada:\n${successCount} usuarios creados`;
        if (errorCount > 0) {
          message += `\n❌ ${errorCount} errores:\n${errors.slice(0, 5).join('\n')}`;
          if (errors.length > 5) message += `\n... y ${errors.length - 5} errores más`;
        }
        
        alert(message);
        setShowModal(false);
        setCsvFile(null);
        loadUsuarios();
      } catch (error) {
        console.error('Error procesando CSV:', error);
        alert('❌ Error al procesar el archivo CSV');
      }
    };
    
    reader.readAsText(csvFile);
  };

  const getRoleConfig = (roleType: string): { rol: UserRole; tipoOperador?: TipoOperador } => {
    const roleMap: Record<string, { rol: UserRole; tipoOperador?: TipoOperador }> = {
      'administrador': { rol: 'administrador' },
      'soporte': { rol: 'soporte' },
      'mayorista': { rol: 'operador', tipoOperador: 'mayorista' },
      'director_comercial': { rol: 'operador', tipoOperador: 'director_comercial' },
      'coordinador_masivos': { rol: 'operador', tipoOperador: 'coordinador_masivos' },
      'ejecutivo_horecas': { rol: 'operador', tipoOperador: 'ejecutivo_horecas' },
      'encargado_hogares': { rol: 'hogares', tipoOperador: 'encargado_hogares' }
    };
    return roleMap[roleType] || { rol: 'operador', tipoOperador: 'mayorista' };
  };

  const handleRoleTypeChange = (roleType: string) => {
    setSelectedRoleType(roleType);
    const { rol, tipoOperador } = getRoleConfig(roleType);
    setNuevoUsuario({
      ...nuevoUsuario,
      rol,
      tipoOperador
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
                  const tipoMap: Record<string, string> = {
                    'encargado_hogares': 'Encargado de Hogares'
                  };
                  rolTexto = tipoMap[user.tipoOperador || ''] || 'Encargado de Hogares';
                  rolValue = user.tipoOperador || 'encargado_hogares';
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
                        <option value="soporte">Soporte</option>
                        <option value="mayorista">Mayorista</option>
                        <option value="director_comercial">Director Comercial</option>
                        <option value="coordinador_masivos">Coordinador de Masivos</option>
                        <option value="ejecutivo_horecas">Ejecutivo Horecas</option>
                        <option value="encargado_hogares">Encargado de Hogares</option>
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Agregar Nuevos Usuarios</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '2px solid #eee', marginBottom: '20px' }}>
              <button
                type="button"
                onClick={() => setModalTab('individual')}
                style={{
                  flex: 1,
                  padding: '15px',
                  border: 'none',
                  background: modalTab === 'individual' ? '#fff' : '#f5f5f5',
                  borderBottom: modalTab === 'individual' ? '3px solid #e63946' : 'none',
                  cursor: 'pointer',
                  fontWeight: modalTab === 'individual' ? 'bold' : 'normal',
                  fontSize: '14px'
                }}
              >
                👤 Individual
              </button>
              <button
                type="button"
                onClick={() => setModalTab('csv')}
                style={{
                  flex: 1,
                  padding: '15px',
                  border: 'none',
                  background: modalTab === 'csv' ? '#fff' : '#f5f5f5',
                  borderBottom: modalTab === 'csv' ? '3px solid #e63946' : 'none',
                  cursor: 'pointer',
                  fontWeight: modalTab === 'csv' ? 'bold' : 'normal',
                  fontSize: '14px'
                }}
              >
                📄 Importar CSV
              </button>
            </div>

            {/* Contenido Individual */}
            {modalTab === 'individual' && (
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
                    value={selectedRoleType}
                    onChange={(e) => handleRoleTypeChange(e.target.value)}
                    required
                  >
                    <option value="administrador">Administrador</option>
                    <option value="soporte">Soporte</option>
                    <option value="mayorista">Mayorista</option>
                    <option value="director_comercial">Director Comercial</option>
                    <option value="coordinador_masivos">Coordinador de Masivos</option>
                    <option value="ejecutivo_horecas">Ejecutivo Horecas</option>
                    <option value="encargado_hogares">Encargado de Hogares</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    ✅ Crear Usuario
                  </button>
                </div>
              </form>
            )}

            {/* Contenido CSV */}
            {modalTab === 'csv' && (
              <form onSubmit={handleCsvUpload} className="usuario-form">
                {/* Formato del archivo CSV */}
                <div style={{ 
                  background: '#f8f9fa', 
                  padding: '15px', 
                  borderRadius: '8px', 
                  marginBottom: '20px',
                  border: '1px solid #dee2e6'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#e63946', fontSize: '14px' }}>
                    📋 Formato del archivo CSV
                  </h4>
                  <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#666' }}>
                    El archivo debe contener las siguientes columnas en este orden:
                  </p>
                  <code style={{ 
                    display: 'block', 
                    background: '#fff', 
                    padding: '10px', 
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#e63946',
                    marginBottom: '10px'
                  }}>
                    nombre,email,password,rol
                  </code>
                  
                  <p style={{ margin: '10px 0 5px 0', fontSize: '13px', fontWeight: 'bold' }}>
                    Roles válidos:
                  </p>
                  <ul style={{ margin: '5px 0', paddingLeft: '20px', fontSize: '12px', color: '#666' }}>
                    <li>administrador</li>
                    <li>mayorista</li>
                    <li>director_comercial</li>
                    <li>coordinador_masivos</li>
                    <li>ejecutivo_horecas</li>
                    <li>soporte</li>
                  </ul>

                  <p style={{ margin: '10px 0 5px 0', fontSize: '13px', fontWeight: 'bold' }}>
                    Ejemplo:
                  </p>
                  <code style={{ 
                    display: 'block', 
                    background: '#fff', 
                    padding: '10px', 
                    borderRadius: '4px',
                    fontSize: '11px',
                    whiteSpace: 'pre-wrap'
                  }}>
                    nombre,email,password,rol{'\n'}
                    Juan Pérez,juan@avellano.com,password123,mayorista{'\n'}
                    María López,maria@avellano.com,password456,soporte
                  </code>
                </div>

                <div className="form-group">
                  <label>Seleccionar archivo CSV *</label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                    required
                    style={{ width: '100%' }}
                  />
                  {csvFile && (
                    <small style={{ color: '#28a745', marginTop: '5px', display: 'block' }}>
                      ✓ Archivo seleccionado: {csvFile.name}
                    </small>
                  )}
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    📤 Importar Usuarios
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
