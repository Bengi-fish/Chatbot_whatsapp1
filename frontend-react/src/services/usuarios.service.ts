import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api';
import type { Usuario } from '../types';

class UsuariosService {
  async getAll(): Promise<Usuario[]> {
    return apiService.get<Usuario[]>(API_ENDPOINTS.USUARIOS.LIST);
  }

  async getById(id: string): Promise<Usuario> {
    return apiService.get<Usuario>(API_ENDPOINTS.USUARIOS.DETAIL(id));
  }

  async create(usuario: Partial<Usuario>): Promise<Usuario> {
    return apiService.post<Usuario>(API_ENDPOINTS.USUARIOS.CREATE, usuario);
  }

  async update(id: string, usuario: Partial<Usuario>): Promise<Usuario> {
    return apiService.put<Usuario>(API_ENDPOINTS.USUARIOS.UPDATE(id), usuario);
  }

  async delete(id: string): Promise<void> {
    return apiService.delete<void>(API_ENDPOINTS.USUARIOS.DELETE(id));
  }

  async toggleStatus(id: string): Promise<Usuario> {
    return apiService.patch<Usuario>(API_ENDPOINTS.USUARIOS.TOGGLE_STATUS(id));
  }
}

export const usuariosService = new UsuariosService();
