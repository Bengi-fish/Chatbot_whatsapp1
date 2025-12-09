import mongoose from 'mongoose'
import { getEnvVar } from './environment.js'

export async function connectDatabase() {
  try {
    const MONGO_URI = getEnvVar('MONGO_URI', 'mongodb://localhost:27017/avellano-chatbot')
    await mongoose.connect(MONGO_URI)
    console.log('✅ MongoDB conectado exitosamente')
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error)
    process.exit(1)
  }
}

export async function disconnectDatabase() {
  await mongoose.disconnect()
  console.log('👋 MongoDB desconectado')
}
