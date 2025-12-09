import mongoose, { Schema, Document } from 'mongoose'

export type TipoResponsable = 'coordinador_masivos' | 'director_comercial' | 'ejecutivo_horecas' | 'mayorista'

export interface ICliente extends Document {
  telefono: string
  nombre?: string
  tipoCliente: 'hogar' | 'tienda' | 'asadero' | 'restaurante_estandar' | 'restaurante_premium' | 'mayorista'
  // Datos específicos para negocios
  nombreNegocio?: string
  ciudad?: string
  direccion?: string
  responsable?: TipoResponsable
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
  tipoCliente: { 
    type: String, 
    enum: ['hogar', 'tienda', 'asadero', 'restaurante_estandar', 'restaurante_premium', 'mayorista'], 
    required: true 
  },
  // Datos de negocio
  nombreNegocio: { type: String },
  ciudad: { type: String },
  direccion: { type: String },
  responsable: { 
    type: String, 
    enum: ['coordinador_masivos', 'director_comercial', 'ejecutivo_horecas', 'mayorista'],
    default: null
  },
  personaContacto: { type: String },
  productosInteres: { type: String },
  // Metadata
  fechaRegistro: { type: Date, default: Date.now },
  ultimaInteraccion: { type: Date, default: Date.now },
  conversaciones: { type: Number, default: 1 },
})

export default mongoose.model<ICliente>('Cliente', ClienteSchema)
