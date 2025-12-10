import * as dotenv from 'dotenv'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import Usuario from '../models/Usuario.js'

dotenv.config()

async function main() {
  const MONGO_URI = process.env.MONGO_URI
  if (!MONGO_URI) {
    console.error('❌ Falta MONGO_URI en el entorno (.env)')
    process.exit(1)
  }

  try {
    await mongoose.connect(MONGO_URI)
    console.log('✅ Conectado a MongoDB')

    // Datos del encargado de hogares
    const email = 'operador5@avellano.com'
    const password = '123456'
    const telefono = '3102325151'
    const nombre = 'Encargado de Ventas Hogares'

    // Verificar si ya existe
    const existing = await Usuario.findOne({ email })
    if (existing) {
      // Actualizar contraseña
      const passwordHash = await bcrypt.hash(password, 10)
      existing.passwordHash = passwordHash
      existing.nombre = nombre
      existing.activo = true
      await existing.save()
      
      console.log('✅ ¡Usuario encargado de hogares actualizado exitosamente!')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log(`👤 Nombre: ${nombre}`)
      console.log(`📧 Email: ${email}`)
      console.log(`📱 Teléfono: ${telefono}`)
      console.log(`🔑 Contraseña: ${password}`)
      console.log(`👔 Rol: hogares`)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('ℹ️ Este usuario solo podrá ver clientes tipo "hogar" en su dashboard')
      process.exit(0)
    }

    // Crear nuevo usuario
    const passwordHash = await bcrypt.hash(password, 10)
    const user = new Usuario({ 
      email, 
      passwordHash, 
      rol: 'hogares',
      tipoOperador: null,
      nombre,
      activo: true
    })
    await user.save()

    console.log('✅ ¡Usuario encargado de hogares creado exitosamente!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`👤 Nombre: ${nombre}`)
    console.log(`📧 Email: ${email}`)
    console.log(`📱 Teléfono: ${telefono}`)
    console.log(`🔑 Contraseña: ${password}`)
    console.log(`👔 Rol: hogares`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('ℹ️ Este usuario solo podrá ver clientes tipo "hogar" en su dashboard')
    
    process.exit(0)
  } catch (err) {
    console.error('❌ Error creando usuario:', err)
    process.exit(1)
  }
}

main()
