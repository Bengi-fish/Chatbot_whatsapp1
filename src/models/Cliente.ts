import mongoose, { Schema, Document } from 'mongoose'

export interface ICliente extends Document {
  telefono: string
  nombre?: string
  tipoCliente: 'hogar' | 'negocio'
  // Datos específicos para negocios
  nombreNegocio?: string
  ciudad?: string
  personaContacto?: string
  productosInteres?: string
  // Metadata
  fechaRegistro: Date
  ultimaInteraccion: Date
  conversaciones: number
}

const ClienteSchema: Schema = new Schema({
  telefono: { type: String, required: true, unique: true },
  nombre: { type: String },
  tipoCliente: { type: String, enum: ['hogar', 'negocio'], required: true },
  // Datos de negocio
  nombreNegocio: { type: String },
  ciudad: { type: String },
  personaContacto: { type: String },
  productosInteres: { type: String },
  // Metadata
  fechaRegistro: { type: Date, default: Date.now },
  ultimaInteraccion: { type: Date, default: Date.now },
  conversaciones: { type: Number, default: 1 },
})

export default mongoose.model<ICliente>('Cliente', ClienteSchema)
