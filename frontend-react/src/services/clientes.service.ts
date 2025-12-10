import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api';
import type { Cliente } from '../types';

class ClientesService {
  async getAll(): Promise<Cliente[]> {
    return apiService.get<Cliente[]>(API_ENDPOINTS.CLIENTES.LIST);
  }

  async getById(id: string): Promise<Cliente> {
    return apiService.get<Cliente>(API_ENDPOINTS.CLIENTES.DETAIL(id));
  }

  async create(cliente: Partial<Cliente>): Promise<Cliente> {
    return apiService.post<Cliente>(API_ENDPOINTS.CLIENTES.CREATE, cliente);
  }

  async update(id: string, cliente: Partial<Cliente>): Promise<Cliente> {
    return apiService.put<Cliente>(API_ENDPOINTS.CLIENTES.UPDATE(id), cliente);
  }

  async delete(id: string): Promise<void> {
    return apiService.delete<void>(API_ENDPOINTS.CLIENTES.DELETE(id));
  }

  async getStats(): Promise<any> {
    return apiService.get(API_ENDPOINTS.CLIENTES.STATS);
  }
}

export const clientesService = new ClientesService();
