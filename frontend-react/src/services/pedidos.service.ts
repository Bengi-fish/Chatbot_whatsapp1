import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api';
import type { Pedido } from '../types';

class PedidosService {
  async getAll(): Promise<Pedido[]> {
    return apiService.get<Pedido[]>(API_ENDPOINTS.PEDIDOS.LIST);
  }

  async getById(id: string): Promise<Pedido> {
    return apiService.get<Pedido>(API_ENDPOINTS.PEDIDOS.DETAIL(id));
  }

  async getByCliente(numero: string): Promise<Pedido[]> {
    return apiService.get<Pedido[]>(API_ENDPOINTS.PEDIDOS.BY_CLIENTE(numero));
  }

  async create(pedido: Partial<Pedido>): Promise<Pedido> {
    return apiService.post<Pedido>(API_ENDPOINTS.PEDIDOS.CREATE, pedido);
  }

  async update(id: string, pedido: Partial<Pedido>): Promise<Pedido> {
    return apiService.put<Pedido>(API_ENDPOINTS.PEDIDOS.UPDATE(id), pedido);
  }

  async delete(id: string): Promise<void> {
    return apiService.delete<void>(API_ENDPOINTS.PEDIDOS.DELETE(id));
  }

  async getStats(): Promise<any> {
    return apiService.get(API_ENDPOINTS.PEDIDOS.STATS);
  }
}

export const pedidosService = new PedidosService();
