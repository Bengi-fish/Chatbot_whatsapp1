import * as dotenv from 'dotenv'
import mongoose from 'mongoose'
import Pedido from '../models/Pedido.js'
import Cliente from '../models/Cliente.js'

dotenv.config()

// Función para generar ID único de pedido
function generarIdPedido(): string {
  const fecha = new Date()
  const year = fecha.getFullYear()
  const month = String(fecha.getMonth() + 1).padStart(2, '0')
  const day = String(fecha.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `AV-${year}${month}${day}-${random}`
}

async function main() {
  const MONGO_URI = process.env.MONGO_URI
  if (!MONGO_URI) {
    console.error('❌ Falta MONGO_URI en el entorno (.env)')
    process.exit(1)
  }

  try {
    await mongoose.connect(MONGO_URI)
    console.log('✅ Conectado a MongoDB')

    // Limpiar pedidos existentes (opcional)
    const deleteExisting = process.argv.includes('--delete')
    if (deleteExisting) {
      await Pedido.deleteMany({})
      console.log('🗑️  Pedidos existentes eliminados')
    }

    // Crear clientes de ejemplo primero
    const clientes = [
      {
        telefono: '573001234567',
        tipoCliente: 'tienda',
        nombreNegocio: 'Tienda Don Pepe',
        ciudad: 'Villavicencio',
        direccion: 'Calle 40 #25-30',
        responsable: 'director_comercial',
        personaContacto: 'José Pérez',
        productosInteres: 'Pollo Entero, Presas Mixtas',
        fechaRegistro: new Date(),
        ultimaInteraccion: new Date(),
        conversaciones: 3,
      },
      {
        telefono: '573109876543',
        tipoCliente: 'asadero',
        nombreNegocio: 'Asadero El Buen Sabor',
        ciudad: 'Villavicencio',
        direccion: 'Carrera 33 #18-45',
        responsable: 'director_comercial',
        personaContacto: 'María González',
        productosInteres: 'Pollo Entero, Alitas',
        fechaRegistro: new Date(),
        ultimaInteraccion: new Date(),
        conversaciones: 5,
      },
      {
        telefono: '573208765432',
        tipoCliente: 'restaurante_estandar',
        nombreNegocio: 'Restaurante La Casona',
        ciudad: 'Acacías',
        direccion: 'Calle 5 #12-20',
        responsable: 'coordinador_masivos',
        personaContacto: 'Carlos Rodríguez',
        productosInteres: 'Pechuga Fileteada, Muslos',
        fechaRegistro: new Date(),
        ultimaInteraccion: new Date(),
        conversaciones: 2,
      },
      {
        telefono: '573157891234',
        tipoCliente: 'restaurante_premium',
        nombreNegocio: 'Hotel & Restaurante Premium',
        ciudad: 'Villavicencio',
        direccion: 'Avenida 40 #50-10',
        responsable: 'ejecutivo_horecas',
        personaContacto: 'Laura Martínez',
        productosInteres: 'Pechuga Premium, Alitas Gourmet',
        fechaRegistro: new Date(),
        ultimaInteraccion: new Date(),
        conversaciones: 4,
      },
      {
        telefono: '573126549870',
        tipoCliente: 'mayorista',
        nombreNegocio: 'Distribuidora Mega',
        ciudad: 'Villavicencio',
        direccion: 'Zona Industrial Calle 15',
        responsable: 'mayorista',
        personaContacto: 'Roberto Sánchez',
        productosInteres: 'Pollo Entero por Bulto, Presas Mixtas',
        fechaRegistro: new Date(),
        ultimaInteraccion: new Date(),
        conversaciones: 6,
      },
    ]

    // Guardar clientes
    for (const clienteData of clientes) {
      const existingCliente = await Cliente.findOne({ telefono: clienteData.telefono })
      if (!existingCliente) {
        await Cliente.create(clienteData)
        console.log(`✅ Cliente creado: ${clienteData.nombreNegocio}`)
      }
    }

    // Crear pedidos de ejemplo
    const pedidos = [
      {
        idPedido: generarIdPedido(),
        telefono: '573001234567',
        tipoCliente: 'tienda',
        nombreNegocio: 'Tienda Don Pepe',
        ciudad: 'Villavicencio',
        direccion: 'Calle 40 #25-30',
        personaContacto: 'José Pérez',
        productos: [
          { nombre: 'Pollo Entero', cantidad: 5, precioUnitario: 19000, subtotal: 95000 },
          { nombre: 'Presas Mixtas (kg)', cantidad: 3, precioUnitario: 18000, subtotal: 54000 },
        ],
        total: 149000,
        coordinadorAsignado: 'Director Comercial',
        telefonoCoordinador: '573108540251',
        estado: 'pendiente',
        fechaPedido: new Date(),
      },
      {
        idPedido: generarIdPedido(),
        telefono: '573109876543',
        tipoCliente: 'asadero',
        nombreNegocio: 'Asadero El Buen Sabor',
        ciudad: 'Villavicencio',
        direccion: 'Carrera 33 #18-45',
        personaContacto: 'María González',
        productos: [
          { nombre: 'Pollo Entero', cantidad: 10, precioUnitario: 19000, subtotal: 190000 },
          { nombre: 'Alitas (kg)', cantidad: 5, precioUnitario: 14000, subtotal: 70000 },
        ],
        total: 260000,
        coordinadorAsignado: 'Director Comercial',
        telefonoCoordinador: '573108540251',
        estado: 'en_proceso',
        fechaPedido: new Date(Date.now() - 2 * 60 * 60 * 1000), // Hace 2 horas
      },
      {
        idPedido: generarIdPedido(),
        telefono: '573208765432',
        tipoCliente: 'restaurante_estandar',
        nombreNegocio: 'Restaurante La Casona',
        ciudad: 'Acacías',
        direccion: 'Calle 5 #12-20',
        personaContacto: 'Carlos Rodríguez',
        productos: [
          { nombre: 'Pechuga Fileteada (kg)', cantidad: 8, precioUnitario: 24000, subtotal: 192000 },
          { nombre: 'Muslos y Contramuslos (kg)', cantidad: 6, precioUnitario: 17000, subtotal: 102000 },
        ],
        total: 294000,
        coordinadorAsignado: 'Coordinador de Masivos',
        telefonoCoordinador: '573232747647',
        estado: 'atendido',
        fechaPedido: new Date(Date.now() - 24 * 60 * 60 * 1000), // Hace 1 día
      },
      {
        idPedido: generarIdPedido(),
        telefono: '573001234567',
        tipoCliente: 'tienda',
        nombreNegocio: 'Tienda Don Pepe',
        ciudad: 'Villavicencio',
        direccion: 'Calle 40 #25-30',
        personaContacto: 'José Pérez',
        productos: [
          { nombre: 'Pollo Entero', cantidad: 2, precioUnitario: 19000, subtotal: 38000 },
          { nombre: 'Alitas (kg)', cantidad: 3, precioUnitario: 14000, subtotal: 42000 },
        ],
        total: 80000,
        coordinadorAsignado: 'Director Comercial',
        telefonoCoordinador: '573108540251',
        estado: 'pendiente',
        fechaPedido: new Date(Date.now() - 30 * 60 * 1000), // Hace 30 minutos
        notas: 'Cliente frecuente - Prioridad alta',
      },
      {
        idPedido: generarIdPedido(),
        telefono: '573109876543',
        tipoCliente: 'asadero',
        nombreNegocio: 'Asadero El Buen Sabor',
        ciudad: 'Villavicencio',
        direccion: 'Carrera 33 #18-45',
        personaContacto: 'María González',
        productos: [
          { nombre: 'Pollo Entero', cantidad: 15, precioUnitario: 19000, subtotal: 285000 },
          { nombre: 'Pechuga (kg)', cantidad: 4, precioUnitario: 22000, subtotal: 88000 },
          { nombre: 'Menudencias (kg)', cantidad: 2, precioUnitario: 8000, subtotal: 16000 },
        ],
        total: 389000,
        coordinadorAsignado: 'Director Comercial',
        telefonoCoordinador: '573108540251',
        estado: 'en_proceso',
        fechaPedido: new Date(Date.now() - 4 * 60 * 60 * 1000), // Hace 4 horas
      },
      {
        idPedido: generarIdPedido(),
        telefono: '573157891234',
        tipoCliente: 'restaurante_premium',
        nombreNegocio: 'Hotel & Restaurante Premium',
        ciudad: 'Villavicencio',
        direccion: 'Avenida 40 #50-10',
        personaContacto: 'Laura Martínez',
        productos: [
          { nombre: 'Pechuga Premium (kg)', cantidad: 12, precioUnitario: 28000, subtotal: 336000 },
          { nombre: 'Alitas Gourmet (kg)', cantidad: 8, precioUnitario: 18000, subtotal: 144000 },
          { nombre: 'Pollo Entero Premium', cantidad: 6, precioUnitario: 25000, subtotal: 150000 },
        ],
        total: 630000,
        coordinadorAsignado: 'Ejecutivo Horecas',
        telefonoCoordinador: '573138479027',
        estado: 'pendiente',
        fechaPedido: new Date(Date.now() - 1 * 60 * 60 * 1000), // Hace 1 hora
        notas: 'Pedido para evento especial',
      },
      {
        idPedido: generarIdPedido(),
        telefono: '573126549870',
        tipoCliente: 'mayorista',
        nombreNegocio: 'Distribuidora Mega',
        ciudad: 'Villavicencio',
        direccion: 'Zona Industrial Calle 15',
        personaContacto: 'Roberto Sánchez',
        productos: [
          { nombre: 'Pollo Entero - Bulto (50 unidades)', cantidad: 2, precioUnitario: 850000, subtotal: 1700000 },
          { nombre: 'Presas Mixtas - Bulto (25 kg)', cantidad: 3, precioUnitario: 400000, subtotal: 1200000 },
          { nombre: 'Pechuga - Bulto (20 kg)', cantidad: 2, precioUnitario: 420000, subtotal: 840000 },
        ],
        total: 3740000,
        coordinadorAsignado: 'Coordinador Mayoristas',
        telefonoCoordinador: '573214057410',
        estado: 'en_proceso',
        fechaPedido: new Date(Date.now() - 6 * 60 * 60 * 1000), // Hace 6 horas
        notas: 'Pedido mayorista - Entrega urgente',
      },
      {
        idPedido: generarIdPedido(),
        telefono: '573208765432',
        tipoCliente: 'restaurante_estandar',
        nombreNegocio: 'Restaurante La Casona',
        ciudad: 'Acacías',
        direccion: 'Calle 5 #12-20',
        personaContacto: 'Carlos Rodríguez',
        productos: [
          { nombre: 'Pollo Entero', cantidad: 8, precioUnitario: 19000, subtotal: 152000 },
          { nombre: 'Muslos y Contramuslos (kg)', cantidad: 5, precioUnitario: 17000, subtotal: 85000 },
        ],
        total: 237000,
        coordinadorAsignado: 'Coordinador de Masivos',
        telefonoCoordinador: '573232747647',
        estado: 'pendiente',
        fechaPedido: new Date(Date.now() - 15 * 60 * 1000), // Hace 15 minutos
      },
      {
        idPedido: generarIdPedido(),
        telefono: '573157891234',
        tipoCliente: 'restaurante_premium',
        nombreNegocio: 'Hotel & Restaurante Premium',
        ciudad: 'Villavicencio',
        direccion: 'Avenida 40 #50-10',
        personaContacto: 'Laura Martínez',
        productos: [
          { nombre: 'Pechuga Premium (kg)', cantidad: 15, precioUnitario: 28000, subtotal: 420000 },
          { nombre: 'Pollo Entero Premium', cantidad: 10, precioUnitario: 25000, subtotal: 250000 },
        ],
        total: 670000,
        coordinadorAsignado: 'Ejecutivo Horecas',
        telefonoCoordinador: '573138479027',
        estado: 'atendido',
        fechaPedido: new Date(Date.now() - 48 * 60 * 60 * 1000), // Hace 2 días
      },
      {
        idPedido: generarIdPedido(),
        telefono: '573126549870',
        tipoCliente: 'mayorista',
        nombreNegocio: 'Distribuidora Mega',
        ciudad: 'Villavicencio',
        direccion: 'Zona Industrial Calle 15',
        personaContacto: 'Roberto Sánchez',
        productos: [
          { nombre: 'Pollo Entero - Bulto (50 unidades)', cantidad: 5, precioUnitario: 850000, subtotal: 4250000 },
          { nombre: 'Alitas - Bulto (30 kg)', cantidad: 2, precioUnitario: 380000, subtotal: 760000 },
        ],
        total: 5010000,
        coordinadorAsignado: 'Coordinador Mayoristas',
        telefonoCoordinador: '573214057410',
        estado: 'atendido',
        fechaPedido: new Date(Date.now() - 72 * 60 * 60 * 1000), // Hace 3 días
        notas: 'Pedido mayorista recurrente - Cliente VIP',
      },
    ]

    // Guardar pedidos
    let creados = 0
    for (const pedidoData of pedidos) {
      await Pedido.create(pedidoData)
      creados++
      console.log(`✅ Pedido creado: ${pedidoData.idPedido} - ${pedidoData.nombreNegocio} - $${pedidoData.total.toLocaleString('es-CO')} - Estado: ${pedidoData.estado}`)
    }

    console.log('\n🎉 ¡Seed completado exitosamente!')
    console.log(`📊 Total de pedidos creados: ${creados}`)
    console.log('\n📋 Resumen por estado:')
    
    const pendientes = pedidos.filter(p => p.estado === 'pendiente').length
    const enProceso = pedidos.filter(p => p.estado === 'en_proceso').length
    const atendidos = pedidos.filter(p => p.estado === 'atendido').length
    
    console.log(`   - Pendientes: ${pendientes}`)
    console.log(`   - En Proceso: ${enProceso}`)
    console.log(`   - Atendidos: ${atendidos}`)
    
    console.log('\n💰 Total en ventas: $' + pedidos.reduce((sum, p) => sum + p.total, 0).toLocaleString('es-CO'))

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('\n👋 Desconectado de MongoDB')
  }
}

main()
