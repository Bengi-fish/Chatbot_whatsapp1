import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api';
import type { Evento } from '../types';

class EventosService {
  async getAll(): Promise<Evento[]> {
    return apiService.get<Evento[]>(API_ENDPOINTS.EVENTOS.LIST);
  }

  async getById(id: string): Promise<Evento> {
    return apiService.get<Evento>(API_ENDPOINTS.EVENTOS.DETAIL(id));
  }

  async markAsRead(id: string): Promise<void> {
    return apiService.patch<void>(API_ENDPOINTS.EVENTOS.MARK_READ(id));
  }

  async delete(id: string): Promise<void> {
    return apiService.delete<void>(API_ENDPOINTS.EVENTOS.DELETE(id));
  }
}

export const eventosService = new EventosService();
