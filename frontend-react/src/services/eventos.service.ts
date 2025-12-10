import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api';
import type { Evento } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  total?: number;
  message?: string;
}

// interface CrearEventoData {
//   nombre: string;
//   mensaje: string;
//   filtros: {
//     tipo: 'todos' | 'hogar' | 'negocios' | 'ciudad' | 'tipo' | 'personalizado';
//     ciudades?: string[];
//     tiposCliente?: string[];
//     telefonos?: string[];
//   };
// }

class EventosService {
  async getAll(): Promise<Evento[]> {
    const response = await apiService.get<ApiResponse<Evento[]>>(API_ENDPOINTS.EVENTOS.LIST);
    return response.data;
  }

  async getById(id: string): Promise<Evento> {
    const response = await apiService.get<ApiResponse<Evento>>(API_ENDPOINTS.EVENTOS.DETAIL(id));
    return response.data;
  }

  async crear(formData: FormData): Promise<any> {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${apiService.baseURL}/eventos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = 'Error al crear evento';
      try {
        const error = await response.json();
        errorMessage = error.message || error.error || errorMessage;
      } catch (e) {
        // Si no es JSON válido, usar el status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async markAsRead(id: string): Promise<void> {
    await apiService.patch<void>(API_ENDPOINTS.EVENTOS.MARK_READ(id));
  }

  async delete(id: string): Promise<void> {
    await apiService.delete<void>(API_ENDPOINTS.EVENTOS.DELETE(id));
  }
}

export const eventosService = new EventosService();
