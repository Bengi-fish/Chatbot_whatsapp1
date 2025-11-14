import mongoose, { Schema, Document } from 'mongoose'

export interface IConversacion extends Document {
  telefono: string
  mensajes: {
    rol: 'usuario' | 'bot'
    mensaje: string
    timestamp: Date
  }[]
  flujoActual: string
  fechaInicio: Date
  fechaUltimoMensaje: Date
}

const ConversacionSchema: Schema = new Schema({
  telefono: { type: String, required: true },
  mensajes: [{
    rol: { type: String, enum: ['usuario', 'bot'], required: true },
    mensaje: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  }],
  flujoActual: { type: String },
  fechaInicio: { type: Date, default: Date.now },
  fechaUltimoMensaje: { type: Date, default: Date.now },
})

export default mongoose.model<IConversacion>('Conversacion', ConversacionSchema)
