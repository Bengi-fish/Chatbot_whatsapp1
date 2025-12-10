import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api';
import type { Conversacion } from '../types';

class ConversacionesService {
  async getAll(): Promise<Conversacion[]> {
    return apiService.get<Conversacion[]>(API_ENDPOINTS.CONVERSACIONES.LIST);
  }

  async getById(id: string): Promise<Conversacion> {
    return apiService.get<Conversacion>(API_ENDPOINTS.CONVERSACIONES.DETAIL(id));
  }

  async getByCliente(numero: string): Promise<Conversacion[]> {
    return apiService.get<Conversacion[]>(API_ENDPOINTS.CONVERSACIONES.BY_CLIENTE(numero));
  }

  async getStats(): Promise<any> {
    return apiService.get(API_ENDPOINTS.CONVERSACIONES.STATS);
  }
}

export const conversacionesService = new ConversacionesService();
