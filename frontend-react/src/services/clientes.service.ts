import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api';
import type { Cliente } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  total?: number;
}

class ClientesService {
  async getAll(): Promise<Cliente[]> {
    const response = await apiService.get<ApiResponse<Cliente[]>>(API_ENDPOINTS.CLIENTES.LIST);
    return response.data;
  }

  async getById(id: string): Promise<Cliente> {
    const response = await apiService.get<ApiResponse<Cliente>>(API_ENDPOINTS.CLIENTES.DETAIL(id));
    return response.data;
  }

  async getByTelefono(telefono: string): Promise<Cliente> {
    const response = await apiService.get<ApiResponse<Cliente>>(`/clientes/${telefono}`);
    return response.data;
  }

  async create(cliente: Partial<Cliente>): Promise<Cliente> {
    const response = await apiService.post<ApiResponse<Cliente>>(API_ENDPOINTS.CLIENTES.CREATE, cliente);
    return response.data;
  }

  async update(id: string, cliente: Partial<Cliente>): Promise<Cliente> {
    const response = await apiService.put<ApiResponse<Cliente>>(API_ENDPOINTS.CLIENTES.UPDATE(id), cliente);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiService.delete<void>(API_ENDPOINTS.CLIENTES.DELETE(id));
  }

  async getStats(): Promise<any> {
    const response = await apiService.get<ApiResponse<any>>(API_ENDPOINTS.CLIENTES.STATS);
    return response.data;
  }
}

export const clientesService = new ClientesService();
