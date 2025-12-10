import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api';
import type { AuthResponse, LoginCredentials, User } from '../types';

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    // Guardar token y datos del usuario
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('user_data', JSON.stringify(response.user));

    return response;
  }

  async logout(): Promise<void> {
    try {
      await apiService.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // Limpiar datos locales siempre
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
    }
  }

  getUser(): User | null {
    const userData = localStorage.getItem('user_data');
    if (!userData) return null;

    try {
      const user = JSON.parse(userData) as User;
      
      // Validar estructura del usuario operador
      if (user.rol === 'operador' && !user.tipoOperador) {
        console.error('❌ Usuario operador sin tipoOperador:', user);
        return null;
      }

      return user;
    } catch (error) {
      console.error('Error parseando user data:', error);
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getUser();
  }

  hasRole(...roles: string[]): boolean {
    const user = this.getUser();
    return user ? roles.includes(user.rol) : false;
  }

  async verifyToken(): Promise<boolean> {
    try {
      await apiService.get(API_ENDPOINTS.AUTH.VERIFY);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const authService = new AuthService();
