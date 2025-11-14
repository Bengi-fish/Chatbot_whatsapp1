import mongoose, { Schema, Document } from 'mongoose'

export interface IPedido extends Document {
  telefono: string
  tipoCliente: 'hogar' | 'negocio'
  productos: string
  estado: 'pendiente' | 'procesando' | 'completado' | 'cancelado'
  fechaPedido: Date
  notas?: string
}

const PedidoSchema: Schema = new Schema({
  telefono: { type: String, required: true },
  tipoCliente: { type: String, enum: ['hogar', 'negocio'], required: true },
  productos: { type: String, required: true },
  estado: { 
    type: String, 
    enum: ['pendiente', 'procesando', 'completado', 'cancelado'], 
    default: 'pendiente' 
  },
  fechaPedido: { type: Date, default: Date.now },
  notas: { type: String },
})

export default mongoose.model<IPedido>('Pedido', PedidoSchema)
