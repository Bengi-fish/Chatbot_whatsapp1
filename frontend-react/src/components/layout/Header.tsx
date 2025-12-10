import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { exportService } from '../../services/export.service';
import { HelpButton } from '../HelpButton/HelpButton';
import type { ExportType } from '../../types';
import './Header.css';

export function Header() {
  const { user } = useAuth();
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const handleExport = async (type: ExportType) => {
    try {
      await exportService.exportData(type);
      setIsExportMenuOpen(false);
    } catch (error) {
      console.error('Error al exportar:', error);
      alert('Error al exportar datos');
    }
  };

  return (
    <header className="top-header" id="dashboard-header">
      <h1 className="page-title">Dashboard</h1>
      <div className="header-right">
        <HelpButton />
        <span className="user-greeting user-profile">
          Bienvenido, {user?.nombre || 'Usuario'}
        </span>
        
        <div className="export-dropdown">
          <button 
            className="export-btn" 
            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
          >
            <span className="export-icon">⬇</span>
            <span>Exportar Datos</span>
          </button>
          
          {isExportMenuOpen && (
            <div className="export-menu">
              <div className="export-menu-header">📊 Exportar para Power BI</div>
              
              <button 
                className="export-menu-item" 
                onClick={() => handleExport('clientes')}
              >
                <span className="export-menu-icon">■</span>
                <div className="export-menu-text">
                  <div className="export-menu-title">Clientes</div>
                  <div className="export-menu-desc">Lista completa de clientes</div>
                </div>
              </button>

              <button 
                className="export-menu-item" 
                onClick={() => handleExport('pedidos')}
              >
                <span className="export-menu-icon">◆</span>
                <div className="export-menu-text">
                  <div className="export-menu-title">Pedidos</div>
                  <div className="export-menu-desc">Histórico de pedidos</div>
                </div>
              </button>

              <button 
                className="export-menu-item" 
                onClick={() => handleExport('conversaciones')}
              >
                <span className="export-menu-icon">●</span>
                <div className="export-menu-text">
                  <div className="export-menu-title">Conversaciones</div>
                  <div className="export-menu-desc">Registro de interacciones</div>
                </div>
              </button>

              <button 
                className="export-menu-item" 
                onClick={() => handleExport('estadisticas')}
              >
                <span className="export-menu-icon">📈</span>
                <div className="export-menu-text">
                  <div className="export-menu-title">Estadísticas</div>
                  <div className="export-menu-desc">Métricas generales</div>
                </div>
              </button>

              <button 
                className="export-menu-item" 
                onClick={() => handleExport('eventos')}
              >
                <span className="export-menu-icon">◉</span>
                <div className="export-menu-text">
                  <div className="export-menu-title">Eventos</div>
                  <div className="export-menu-desc">Log de eventos</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
