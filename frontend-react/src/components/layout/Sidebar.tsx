import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Sidebar.css';

export function Sidebar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const firstLetter = (user.nombre || user.email).charAt(0).toUpperCase();
  const rolTexto = user.tipoOperador 
    ? `${user.rol.toUpperCase()} - ${user.tipoOperador.replace(/_/g, ' ').toUpperCase()}`
    : user.rol.toUpperCase();

  const isOperador = user.rol === 'operador';
  const isHogares = user.rol === 'hogares';
  const isAdmin = user.rol === 'administrador';

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-logo">
          <img src="/assets/images/LOGO_AVELLANO.png" alt="Logo Avellano" />
        </div>
        <h2 className="sidebar-title">Avellano</h2>
      </div>

      <div className="user-card">
        <div className="user-avatar">{firstLetter}</div>
        <div className="user-details">
          <h3 className="user-card-name">{user.nombre || 'Usuario'}</h3>
          <p className="user-card-email">{user.email}</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard/clientes" className="nav-item">
          <span className="nav-icon">■</span>
          <span className="nav-label">Clientes</span>
        </NavLink>

        <NavLink to="/dashboard/pedidos" className="nav-item">
          <span className="nav-icon">◆</span>
          <span className="nav-label">Pedidos</span>
        </NavLink>

        <NavLink to="/dashboard/conversaciones" className="nav-item">
          <span className="nav-icon">●</span>
          <span className="nav-label">Conversaciones</span>
        </NavLink>

        {!isOperador && !isHogares && (
          <NavLink to="/dashboard/eventos" className="nav-item">
            <span className="nav-icon">◉</span>
            <span className="nav-label">Eventos</span>
          </NavLink>
        )}

        {isAdmin && (
          <NavLink to="/dashboard/usuarios" className="nav-item">
            <span className="nav-icon">▲</span>
            <span className="nav-label">Usuarios</span>
          </NavLink>
        )}
      </nav>

      <div className="sidebar-actions">
        <button className="action-btn refresh-btn" onClick={() => window.location.reload()}>
          <span>↻</span> Actualizar
        </button>
        <button className="action-btn logout-btn" onClick={handleLogout}>
          <span>⤳</span> Salir
        </button>
      </div>

      <div className="sidebar-footer">
        <div className={`role-badge rol-${user.rol}`}>{rolTexto}</div>
      </div>
    </aside>
  );
}
