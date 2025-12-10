import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api';
import type { Conversacion } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  total?: number;
}

class ConversacionesService {
  async getAll(): Promise<Conversacion[]> {
    const response = await apiService.get<ApiResponse<Conversacion[]>>(API_ENDPOINTS.CONVERSACIONES.LIST);
    return response.data;
  }

  async getById(id: string): Promise<Conversacion> {
    const response = await apiService.get<ApiResponse<Conversacion>>(API_ENDPOINTS.CONVERSACIONES.DETAIL(id));
    return response.data;
  }

  async getByCliente(numero: string): Promise<Conversacion[]> {
    const response = await apiService.get<ApiResponse<Conversacion[]>>(API_ENDPOINTS.CONVERSACIONES.BY_CLIENTE(numero));
    return response.data;
  }

  async getByTelefono(telefono: string): Promise<Conversacion> {
    const response = await apiService.get<ApiResponse<Conversacion>>(`/conversaciones/${telefono}`);
    return response.data;
  }

  async getStats(): Promise<any> {
    const response = await apiService.get<ApiResponse<any>>(API_ENDPOINTS.CONVERSACIONES.STATS);
    return response.data;
  }
}

export const conversacionesService = new ConversacionesService();
