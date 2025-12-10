import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api';
import type { Pedido } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  total?: number;
  count?: number;
}

interface EstadisticasPedidos {
  total: number;
  pendientes: number;
  enProceso: number;
  atendidos: number;
  cancelados: number;
}

class PedidosService {
  async getAll(): Promise<Pedido[]> {
    const response = await apiService.get<ApiResponse<Pedido[]>>(`${API_ENDPOINTS.PEDIDOS.LIST}?t=${Date.now()}`);
    return response.data;
  }

  async getById(id: string): Promise<Pedido> {
    const response = await apiService.get<ApiResponse<Pedido>>(API_ENDPOINTS.PEDIDOS.DETAIL(id));
    return response.data;
  }

  async getByCliente(numero: string): Promise<Pedido[]> {
    const response = await apiService.get<ApiResponse<Pedido[]>>(`${API_ENDPOINTS.PEDIDOS.LIST}?telefono=${numero}`);
    return response.data;
  }

  async create(pedido: Partial<Pedido>): Promise<Pedido> {
    const response = await apiService.post<ApiResponse<Pedido>>(API_ENDPOINTS.PEDIDOS.CREATE, pedido);
    return response.data;
  }

  async update(id: string, pedido: Partial<Pedido>): Promise<Pedido> {
    const response = await apiService.patch<ApiResponse<Pedido>>(API_ENDPOINTS.PEDIDOS.UPDATE(id), pedido);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiService.delete<void>(API_ENDPOINTS.PEDIDOS.DELETE(id));
  }

  async getStats(): Promise<EstadisticasPedidos> {
    const response = await apiService.get<ApiResponse<EstadisticasPedidos>>(API_ENDPOINTS.PEDIDOS.STATS);
    return response.data;
  }

  // Métodos para cambiar estado
  async updateEstado(id: string, estado: 'pendiente' | 'en_proceso' | 'atendido' | 'cancelado', nota?: string): Promise<Pedido> {
    const response = await apiService.patch<ApiResponse<Pedido>>(`/pedidos/${id}/estado`, {
      estado,
      ...(nota && { notasCancelacion: nota })
    });
    return response.data;
  }

  async tomarPedido(id: string): Promise<Pedido> {
    return this.updateEstado(id, 'en_proceso');
  }

  async completarPedido(id: string): Promise<Pedido> {
    return this.updateEstado(id, 'atendido');
  }

  async cancelarPedido(id: string, motivo: string): Promise<Pedido> {
    return this.updateEstado(id, 'cancelado', motivo);
  }

  // Enviar mensaje de WhatsApp
  async enviarMensajeWhatsApp(telefono: string, mensaje: string): Promise<any> {
    const response = await apiService.post<ApiResponse<any>>('/whatsapp/enviar-mensaje', {
      telefono,
      mensaje
    });
    return response.data;
  }
}

export const pedidosService = new PedidosService();
