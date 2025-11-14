import mongoose, { Schema, Document } from 'mongoose'

export interface IUsuario extends Document {
  email: string
  passwordHash: string
  createdAt: Date
}

const UsuarioSchema: Schema<IUsuario> = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.model<IUsuario>('Usuario', UsuarioSchema)