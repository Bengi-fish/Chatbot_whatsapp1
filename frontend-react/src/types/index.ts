// Tipos de usuario y autenticación
export type UserRole = 'administrador' | 'soporte' | 'operador';
export type TipoOperador = 'pedidos' | 'conversaciones' | 'general';

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  tipoOperador?: TipoOperador;
  activo: boolean;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Tipos de datos del negocio
export interface Cliente {
  _id: string;
  numero: string;
  nombre?: string;
  email?: string;
  direccion?: string;
  ultimaInteraccion?: Date;
  conversaciones?: number;
  pedidos?: number;
  totalGastado?: number;
  estado: 'activo' | 'inactivo';
  createdAt: Date;
  updatedAt: Date;
}

export interface Pedido {
  _id: string;
  clienteNumero: string;
  clienteNombre?: string;
  productos: ProductoPedido[];
  total: number;
  estado: 'pendiente' | 'confirmado' | 'enviado' | 'entregado' | 'cancelado';
  fechaPedido: Date;
  fechaEntrega?: Date;
  direccionEntrega?: string;
  notasAdicionales?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductoPedido {
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Conversacion {
  _id: string;
  clienteNumero: string;
  clienteNombre?: string;
  mensajes: Mensaje[];
  iniciadaEn: Date;
  ultimoMensaje: Date;
  estado: 'activa' | 'finalizada';
  duracion?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Mensaje {
  remitente: 'cliente' | 'bot' | 'operador';
  contenido: string;
  timestamp: Date;
  tipo?: 'texto' | 'imagen' | 'audio' | 'documento';
}

export interface Evento {
  _id: string;
  tipo: 'info' | 'warning' | 'error' | 'success';
  categoria: string;
  mensaje: string;
  detalles?: Record<string, any>;
  usuario?: string;
  timestamp: Date;
  leido: boolean;
}

export interface Usuario {
  _id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  tipoOperador?: TipoOperador;
  activo: boolean;
  ultimoAcceso?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para filtros y búsqueda
export interface FilterOptions {
  searchTerm?: string;
  estado?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  rol?: UserRole;
  tipoOperador?: TipoOperador;
}

// Tipos para exportación
export type ExportType = 'clientes' | 'pedidos' | 'conversaciones' | 'estadisticas' | 'eventos';

export interface ExportOptions {
  type: ExportType;
  format: 'json' | 'csv';
  dateRange?: {
    start: Date;
    end: Date;
  };
}
