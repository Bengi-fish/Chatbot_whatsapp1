import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/auth.service';
import type { User, LoginCredentials } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (...roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay usuario y token válido en localStorage al cargar
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const currentUser = authService.getUser();
        
        // Si no hay token o no hay usuario, limpiar sesión
        if (!token || !currentUser) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user_data');
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        // Verificar que el token sea válido haciendo una petición de prueba
        // Si falla, el interceptor de axios limpiará la sesión automáticamente
        setUser(currentUser);
      } catch (error) {
        console.error('Error verificando autenticación:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  const hasRole = (...roles: string[]): boolean => {
    return user ? roles.includes(user.rol) : false;
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
