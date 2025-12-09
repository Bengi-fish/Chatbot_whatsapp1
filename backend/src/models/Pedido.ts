import mongoose, { Schema, Document } from 'mongoose'

export interface IProductoPedido {
  nombre: string
  cantidad: number
  precioUnitario: number
  subtotal: number
}

export interface IHistorialEstado {
  estado: 'pendiente' | 'en_proceso' | 'atendido' | 'cancelado'
  fecha: Date
  operadorEmail?: string
  operadorId?: string
  nota?: string
}

export interface IPedido extends Document {
  idPedido: string
  telefono: string
  tipoCliente: string
  nombreNegocio?: string
  ciudad?: string
  direccion?: string
  personaContacto?: string
  productos: IProductoPedido[]
  total: number
  coordinadorAsignado: string
  telefonoCoordinador: string
  estado: 'pendiente' | 'en_proceso' | 'atendido' | 'cancelado'
  fechaPedido: Date
  notas?: string
  notasCancelacion?: string
  historialEstados: IHistorialEstado[]
}

const ProductoPedidoSchema = new Schema({
  nombre: { type: String, required: true },
  cantidad: { type: Number, required: true },
  precioUnitario: { type: Number, required: true },
  subtotal: { type: Number, required: true },
}, { _id: false })

const HistorialEstadoSchema = new Schema({
  estado: { 
    type: String, 
    enum: ['pendiente', 'en_proceso', 'atendido', 'cancelado'], 
    required: true 
  },
  fecha: { type: Date, default: Date.now },
  operadorEmail: { type: String },
  operadorId: { type: String },
  nota: { type: String }
}, { _id: false })

const PedidoSchema: Schema = new Schema({
  idPedido: { type: String, required: true, unique: true },
  telefono: { type: String, required: true },
  tipoCliente: { type: String, required: true },
  nombreNegocio: { type: String },
  ciudad: { type: String },
  direccion: { type: String },
  personaContacto: { type: String },
  productos: [ProductoPedidoSchema],
  total: { type: Number, required: true },
  coordinadorAsignado: { type: String, required: true },
  telefonoCoordinador: { type: String, required: true },
  estado: { 
    type: String, 
    enum: ['pendiente', 'en_proceso', 'atendido', 'cancelado'], 
    default: 'pendiente' 
  },
  fechaPedido: { type: Date, default: Date.now },
  notas: { type: String },
  notasCancelacion: { type: String },
  historialEstados: [HistorialEstadoSchema]
})

// Índices para búsqueda rápida
PedidoSchema.index({ idPedido: 1 })
PedidoSchema.index({ telefono: 1 })
PedidoSchema.index({ fechaPedido: -1 })

export default mongoose.model<IPedido>('Pedido', PedidoSchema)
