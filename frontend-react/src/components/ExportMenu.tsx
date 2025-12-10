import { useState } from 'react';
import { exportService } from '../services/export.service';
import type { ExportType } from '../types';
import './ExportMenu.css';

export function ExportMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (type: ExportType) => {
    setIsExporting(true);
    try {
      await exportService.exportData(type);
      alert(`Datos de ${type} exportados exitosamente`);
      setIsOpen(false);
    } catch (error) {
      console.error('Error al exportar:', error);
      alert('Error al exportar los datos');
    } finally {
      setIsExporting(false);
    }
  };

  const exportOptions: { type: ExportType; label: string; icon: string }[] = [
    { type: 'clientes', label: 'Clientes', icon: '👥' },
    { type: 'pedidos', label: 'Pedidos', icon: '📦' },
    { type: 'conversaciones', label: 'Conversaciones', icon: '💬' },
    { type: 'estadisticas', label: 'Estadísticas', icon: '📊' },
    { type: 'eventos', label: 'Eventos', icon: '📢' },
  ];

  return (
    <div className="export-menu-container">
      <button
        className={`export-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Exportar para Power BI"
        disabled={isExporting}
      >
        📊 Power BI
      </button>

      {isOpen && (
        <>
          <div className="export-overlay" onClick={() => setIsOpen(false)} />
          <div className="export-dropdown">
            <div className="export-dropdown-header">
              <span>Exportar Datos</span>
              <button className="close-dropdown" onClick={() => setIsOpen(false)}>×</button>
            </div>
            <div className="export-options">
              {exportOptions.map(option => (
                <button
                  key={option.type}
                  className="export-option"
                  onClick={() => handleExport(option.type)}
                  disabled={isExporting}
                >
                  <span className="export-icon">{option.icon}</span>
                  <span className="export-label">{option.label}</span>
                </button>
              ))}
            </div>
            <div className="export-footer">
              <small>Formato: JSON para Power BI</small>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
