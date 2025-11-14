import * as dotenv from 'dotenv'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import Usuario from '../models/Usuario'

dotenv.config()

function getArg(name: string, fallback?: string) {
  const prefix = `--${name}=`
  const found = process.argv.find(a => a.startsWith(prefix))
  return found ? found.slice(prefix.length) : fallback
}

async function main() {
  const email = (getArg('email') || process.env.SEED_EMAIL || '').trim().toLowerCase()
  const password = getArg('password') || process.env.SEED_PASSWORD || ''
  const updateIfExists = ['1', 'true', 'yes'].includes((getArg('update') || process.env.SEED_UPDATE || '').toLowerCase())

  if (!email || !password) {
    console.error('❌ Debes proporcionar --email y --password (o variables SEED_EMAIL / SEED_PASSWORD)')
    process.exit(1)
  }

  const MONGO_URI = process.env.MONGO_URI
  if (!MONGO_URI) {
    console.error('❌ Falta MONGO_URI en el entorno (.env)')
    process.exit(1)
  }

  try {
    await mongoose.connect(MONGO_URI)
    console.log('✅ Conectado a MongoDB')

    const existing = await Usuario.findOne({ email })
    if (existing) {
      if (!updateIfExists) {
        console.log(`ℹ️ El usuario ${email} ya existe. Usa --update=true para actualizar la contraseña.`)
        process.exit(0)
      }
      const passwordHash = await bcrypt.hash(password, 10)
      existing.passwordHash = passwordHash
      await existing.save()
      console.log(`🔑 Contraseña actualizada para ${email}`)
      process.exit(0)
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = new Usuario({ email, passwordHash })
    await user.save()
    console.log(`✅ Usuario creado: ${email} (id: ${user._id})`)
    process.exit(0)
  } catch (err) {
    console.error('❌ Error en seed:', err)
    process.exit(1)
  }
}

main()
