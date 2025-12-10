import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api';
import type { ExportType } from '../types';

class ExportService {
  async exportData(type: ExportType): Promise<void> {
    let endpoint: string;
    let filename: string;

    switch (type) {
      case 'clientes':
        endpoint = API_ENDPOINTS.EXPORT.CLIENTES;
        filename = `clientes_${Date.now()}.json`;
        break;
      case 'pedidos':
        endpoint = API_ENDPOINTS.EXPORT.PEDIDOS;
        filename = `pedidos_${Date.now()}.json`;
        break;
      case 'conversaciones':
        endpoint = API_ENDPOINTS.EXPORT.CONVERSACIONES;
        filename = `conversaciones_${Date.now()}.json`;
        break;
      case 'estadisticas':
        endpoint = API_ENDPOINTS.EXPORT.ESTADISTICAS;
        filename = `estadisticas_${Date.now()}.json`;
        break;
      case 'eventos':
        endpoint = API_ENDPOINTS.EXPORT.EVENTOS;
        filename = `eventos_${Date.now()}.json`;
        break;
      default:
        throw new Error(`Tipo de exportación no soportado: ${type}`);
    }

    await apiService.downloadFile(endpoint, filename);
  }
}

export const exportService = new ExportService();
