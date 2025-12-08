import express from 'express'
import cors from 'cors'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import Cliente from './models/Cliente.js'
import Pedido from './models/Pedido.js'
import Conversacion from './models/Conversacion.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Usuario from './models/Usuario.js'
import { verificarToken, soloAdmin, adminOOperador, permisoEscritura, filtrarPedidosPorOperador, AuthRequest } from './middleware/auth.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = 3009 // Puerto diferente al del bot

// Middlewares
app.use(cors())
app.use(express.json())

// Middleware para desactivar caché
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  res.setHeader('Surrogate-Control', 'no-store')
  next()
})

// Nota: Servimos estáticos DESPUÉS de definir la ruta protegida '/'

// Conectar a MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/avellano-chatbot'

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ API conectada a MongoDB'))
  .catch((error) => {
    console.error('❌ Error conectando API a MongoDB:', error)
    process.exit(1)
  })

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret'

// Funciones para generar tokens
function generateAccessToken(payload: any) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' })
}

function generateRefreshToken(payload: any) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' })
}

// ========== ENDPOINTS DE LA API ==========
// ========== ENDPOINTS DE AUTENTICACIÓN ==========
// Endpoint registro
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, rol, nombre } = req.body
    
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email y password requeridos' })
    }
    
    // Validar rol
    const rolesValidos = ['administrador', 'operador', 'soporte']
    if (rol && !rolesValidos.includes(rol)) {
      return res.status(400).json({ success: false, error: 'Rol inválido' })
    }
    
    const existe = await Usuario.findOne({ email })
    if (existe) {
      return res.status(409).json({ success: false, error: 'Usuario ya existe' })
    }
    
    const passwordHash = await bcrypt.hash(password, 10)
    const user = new Usuario({ 
      email, 
      passwordHash,
      rol: rol || 'soporte',
      nombre: nombre || email.split('@')[0],
      activo: true
    })
    await user.save()
    
    // Generar tokens para el nuevo usuario
    const payload = { 
      uid: user._id, 
      email: user.email, 
      rol: user.rol,
      tipoOperador: user.tipoOperador,
      nombre: user.nombre 
    }
    const accessToken = generateAccessToken(payload)
    const refreshToken = generateRefreshToken(payload)
    
    user.refreshToken = refreshToken
    await user.save()
    
    res.json({ 
      success: true, 
      accessToken,
      refreshToken,
      user: {
        email: user.email,
        rol: user.rol,
        tipoOperador: user.tipoOperador,
        nombre: user.nombre
      }
    })
  } catch (e) {
    res.status(500).json({ success: false, error: 'Error registrando usuario' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email y password requeridos' })
    }
    
    const user = await Usuario.findOne({ email })
    if (!user) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas' })
    }
    
    if (!user.activo) {
      return res.status(401).json({ success: false, error: 'Usuario desactivado' })
    }
    
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas' })
    }
    
    const payload = { 
      uid: user._id, 
      email: user.email, 
      rol: user.rol,
      tipoOperador: user.tipoOperador,
      nombre: user.nombre 
    }
    const accessToken = generateAccessToken(payload)
    const refreshToken = generateRefreshToken(payload)
    
    user.refreshToken = refreshToken
    await user.save()
    
    res.json({ 
      success: true, 
      accessToken,
      refreshToken,
      user: {
        email: user.email,
        rol: user.rol,
        tipoOperador: user.tipoOperador,
        nombre: user.nombre
      }
    })
  } catch (e) {
    res.status(500).json({ success: false, error: 'Error en login' })
  }
})

// Endpoint para renovar access token usando refresh token
app.post('/api/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) return res.status(401).json({ success: false, error: 'Refresh token requerido' })
    
    // Verificar refresh token
    const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any
    
    // Verificar que el token existe en BD
    const user = await Usuario.findById(payload.uid)
    if (!user || user.refreshToken !== refreshToken || !user.activo) {
      return res.status(401).json({ success: false, error: 'Refresh token inválido' })
    }
    
    // Generar nuevos tokens (IMPORTANTE: incluir tipoOperador)
    const newPayload = { 
      uid: user._id, 
      email: user.email, 
      rol: user.rol,
      tipoOperador: user.tipoOperador,  // ⭐ Preservar tipoOperador
      nombre: user.nombre 
    }
    const newAccessToken = generateAccessToken(newPayload)
    const newRefreshToken = generateRefreshToken(newPayload)
    
    // Actualizar refresh token en BD
    user.refreshToken = newRefreshToken
    await user.save()
    
    res.json({ 
      success: true, 
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {  // ⭐ Incluir datos completos del usuario
        _id: user._id,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol,
        tipoOperador: user.tipoOperador,
        activo: user.activo
      }
    })
  } catch (e) {
    return res.status(401).json({ success: false, error: 'Refresh token inválido o expirado' })
  }
})

// Endpoint para logout: invalidar refresh token
app.post('/api/auth/logout', async (req, res) => {
  try {
    const auth = req.headers.authorization || ''
    const [, token] = auth.split(' ')
    
    if (token) {
      const payload = jwt.verify(token, JWT_SECRET) as any
      const user = await Usuario.findById(payload.uid)
      if (user) {
        user.refreshToken = undefined
        await user.save()
      }
    }
    
    res.json({ success: true })
  } catch (e) {
    res.json({ success: true })
  }
})

// ========== ENDPOINTS PROTEGIDOS ==========

// Endpoint para obtener info del usuario actual
app.get('/api/auth/me', verificarToken, async (req: AuthRequest, res) => {
  try {
    const user = await Usuario.findById(req.user!.uid).select('-passwordHash -refreshToken')
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' })
    }
    res.json({ success: true, data: user })
  } catch (e) {
    res.status(500).json({ success: false, error: 'Error obteniendo usuario' })
  }
})

// ========== GESTIÓN DE USUARIOS (Solo Admin) ==========

// Listar todos los usuarios (solo admin)
app.get('/api/usuarios', verificarToken, soloAdmin, async (req: AuthRequest, res) => {
  try {
    const usuarios = await Usuario.find().select('-passwordHash -refreshToken').sort({ createdAt: -1 })
    res.json({ success: true, data: usuarios })
  } catch (e) {
    res.status(500).json({ success: false, error: 'Error obteniendo usuarios' })
  }
})

// Actualizar rol de usuario (solo admin)
app.patch('/api/usuarios/:id/rol', verificarToken, soloAdmin, async (req: AuthRequest, res) => {
  try {
    const { rol } = req.body
    const rolesValidos = ['administrador', 'operador', 'soporte']
    
    if (!rolesValidos.includes(rol)) {
      return res.status(400).json({ success: false, error: 'Rol inválido' })
    }
    
    const user = await Usuario.findByIdAndUpdate(
      req.params.id,
      { rol, updatedAt: new Date() },
      { new: true }
    ).select('-passwordHash -refreshToken')
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' })
    }
    
    res.json({ success: true, data: user })
  } catch (e) {
    res.status(500).json({ success: false, error: 'Error actualizando rol' })
  }
})

// Activar/Desactivar usuario (solo admin)
app.patch('/api/usuarios/:id/estado', verificarToken, soloAdmin, async (req: AuthRequest, res) => {
  try {
    const { activo } = req.body
    
    const user = await Usuario.findByIdAndUpdate(
      req.params.id,
      { activo, updatedAt: new Date() },
      { new: true }
    ).select('-passwordHash -refreshToken')
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' })
    }
    
    res.json({ success: true, data: user })
  } catch (e) {
    res.status(500).json({ success: false, error: 'Error actualizando estado' })
  }
})

// Eliminar usuario (solo admin)
app.delete('/api/usuarios/:id', verificarToken, soloAdmin, async (req: AuthRequest, res) => {
  try {
    const user = await Usuario.findByIdAndDelete(req.params.id)
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' })
    }
    
    res.json({ success: true, message: 'Usuario eliminado' })
  } catch (e) {
    res.status(500).json({ success: false, error: 'Error eliminando usuario' })
  }
})

// ========== ENDPOINTS DE DATOS ==========

// Ruta dashboard protegida (debe ir ANTES de servir estáticos)
app.get('/', (req, res) => {
  // Servir el dashboard sin validación - la validación ocurre en app.js
  return res.sendFile(join(__dirname, '../public/index.html'))
})

// 📊 Clientes - Filtrados por responsable del operador
app.get('/api/clientes', verificarToken, async (req: AuthRequest, res) => {
  try {
    let filtro: any = {}
    
    // Soporte no debería ver clientes
    if (req.user!.rol === 'soporte') {
      return res.json({ success: true, total: 0, data: [] })
    }
    
    // Si es operador, filtrar por su tipo de responsabilidad
    if (req.user!.rol === 'operador' && req.user!.tipoOperador) {
      filtro = { responsable: req.user!.tipoOperador }
    }
    
    // Administrador ve todos los clientes (filtro vacío)
    
    const clientes = await Cliente.find(filtro).sort({ fechaRegistro: -1 })
    
    res.json({
      success: true,
      total: clientes.length,
      data: clientes,
    })
  } catch (error) {
    console.error('❌ Error obteniendo clientes:', error)
    res.status(500).json({
      success: false,
      error: 'Error obteniendo clientes',
    })
  }
})

// 🔍 Obtener un cliente por teléfono (solo admin y operador)
app.get('/api/clientes/:telefono', verificarToken, adminOOperador, async (req: AuthRequest, res) => {
  try {
    const cliente = await Cliente.findOne({ telefono: req.params.telefono })
    if (!cliente) {
      return res.status(404).json({
        success: false,
        error: 'Cliente no encontrado',
      })
    }
    res.json({
      success: true,
      data: cliente,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error obteniendo cliente',
    })
  }
})

// 📋 Obtener todos los pedidos (admin, operador y soporte)
app.get('/api/pedidos', verificarToken, async (req: AuthRequest, res) => {
  try {
    let pedidos = []
    
    console.log('📋 Cargando pedidos para usuario:', {
      rol: req.user!.rol,
      tipoOperador: req.user!.tipoOperador
    })
    
    // Si es operador, filtrar pedidos solo de clientes asignados a él
    if (req.user!.rol === 'operador' && req.user!.tipoOperador) {
      // Primero obtener los teléfonos de los clientes asignados al operador
      const clientesAsignados = await Cliente.find(
        { responsable: req.user!.tipoOperador },
        { telefono: 1 }
      ).lean()
      
      console.log('👥 Clientes asignados encontrados:', clientesAsignados.length)
      console.log('📞 Detalles de clientes:', clientesAsignados)
      
      const telefonos = clientesAsignados.map(c => c.telefono)
      console.log('📞 Teléfonos a buscar:', telefonos)
      
      // Si no hay clientes asignados, retornar array vacío
      if (telefonos.length === 0) {
        console.log('⚠️ No hay clientes asignados al operador')
        return res.json({
          success: true,
          total: 0,
          data: []
        })
      }
      
      // Filtrar pedidos solo de esos clientes
      pedidos = await Pedido.find({ telefono: { $in: telefonos } }).sort({ fechaPedido: -1 }).lean()
      console.log('📦 Pedidos encontrados:', pedidos.length)
      console.log('📦 Pedidos:', pedidos.map(p => ({ id: p.idPedido, telefono: p.telefono })))
    } else {
      // Administrador y soporte ven todos los pedidos
      pedidos = await Pedido.find({}).sort({ fechaPedido: -1 }).lean()
      console.log('📦 Pedidos totales:', pedidos.length)
    }
    
    res.json({
      success: true,
      total: pedidos.length,
      data: pedidos,
    })
  } catch (error) {
    console.error('❌ Error obteniendo pedidos:', error)
    res.status(500).json({
      success: false,
      error: 'Error obteniendo pedidos',
    })
  }
})

// 📦 Obtener un pedido específico por ID
app.get('/api/pedidos/:id', verificarToken, async (req: AuthRequest, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id).lean()
    
    if (!pedido) {
      return res.status(404).json({ success: false, error: 'Pedido no encontrado' })
    }
    
    // Verificar permisos: operadores solo pueden ver pedidos de sus clientes
    if (req.user!.rol === 'operador' && req.user!.tipoOperador) {
      const cliente = await Cliente.findOne({ telefono: pedido.telefono }).lean()
      
      if (!cliente || cliente.responsable !== req.user!.tipoOperador) {
        return res.status(403).json({ success: false, error: 'No tienes permiso para ver este pedido' })
      }
    }
    
    res.json({ success: true, data: pedido })
  } catch (error) {
    console.error('❌ Error obteniendo pedido:', error)
    res.status(500).json({ success: false, error: 'Error obteniendo pedido' })
  }
})

// 🔄 Actualizar estado de un pedido
app.patch('/api/pedidos/:id/estado', verificarToken, permisoEscritura, async (req: AuthRequest, res) => {
  try {
    const { estado, notasCancelacion } = req.body
    
    const estadosPermitidos = ['pendiente', 'en_proceso', 'atendido', 'cancelado']
    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({ success: false, error: 'Estado inválido' })
    }
    
    const pedido = await Pedido.findById(req.params.id)
    
    if (!pedido) {
      return res.status(404).json({ success: false, error: 'Pedido no encontrado' })
    }
    
    // Verificar permisos: operadores solo pueden actualizar pedidos de sus clientes
    if (req.user!.rol === 'operador' && req.user!.tipoOperador) {
      const cliente = await Cliente.findOne({ telefono: pedido.telefono }).lean()
      
      if (!cliente || cliente.responsable !== req.user!.tipoOperador) {
        return res.status(403).json({ success: false, error: 'No tienes permiso para modificar este pedido' })
      }
    }
    
    // Actualizar estado
    pedido.estado = estado
    
    // Si se cancela, agregar notas
    if (estado === 'cancelado' && notasCancelacion) {
      pedido.notas = (pedido.notas ? pedido.notas + '\n\n' : '') + `CANCELADO: ${notasCancelacion}`
    }
    
    await pedido.save()
    
    console.log(`✅ Pedido ${pedido.idPedido} actualizado a estado: ${estado}`)
    
    res.json({ success: true, data: pedido })
  } catch (error) {
    console.error('❌ Error actualizando estado del pedido:', error)
    res.status(500).json({ success: false, error: 'Error actualizando estado del pedido' })
  }
})

// 💬 Obtener todas las conversaciones (solo admin y operador)
app.get('/api/conversaciones', verificarToken, adminOOperador, async (req: AuthRequest, res) => {
  try {
    const conversaciones = await Conversacion.find().sort({ fechaUltimoMensaje: -1 })
    
    // Enriquecer con datos del cliente
    const conversacionesEnriquecidas = await Promise.all(
      conversaciones.map(async (conv) => {
        const cliente = await Cliente.findOne({ telefono: conv.telefono })
        return {
          ...conv.toObject(),
          nombreCliente: cliente?.nombre || conv.nombreCliente,
          nombreNegocio: cliente?.nombreNegocio || conv.nombreNegocio,
          tipoCliente: cliente?.tipoCliente
        }
      })
    )
    
    res.json({
      success: true,
      total: conversacionesEnriquecidas.length,
      data: conversacionesEnriquecidas,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error obteniendo conversaciones',
    })
  }
})

// 💬 Obtener detalle de una conversación específica
app.get('/api/conversaciones/:telefono', verificarToken, adminOOperador, async (req: AuthRequest, res) => {
  try {
    const conversacion = await Conversacion.findOne({ telefono: req.params.telefono })
    if (!conversacion) {
      return res.status(404).json({ success: false, error: 'Conversación no encontrada' })
    }
    
    const cliente = await Cliente.findOne({ telefono: req.params.telefono })
    
    res.json({
      success: true,
      data: {
        ...conversacion.toObject(),
        nombreCliente: cliente?.nombre,
        nombreNegocio: cliente?.nombreNegocio,
        tipoCliente: cliente?.tipoCliente,
        clienteInfo: cliente
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error obteniendo conversación' })
  }
})

// 📊 Estadísticas generales (todos pueden ver)
app.get('/api/stats', verificarToken, async (req: AuthRequest, res) => {
  try {
    let filtro: any = {}
    
    // Soporte no debería ver estadísticas de clientes
    if (req.user!.rol === 'soporte') {
      return res.json({
        success: true,
        data: {
          clientes: { total: 0, hogar: 0, negocio: 0, hoy: 0 },
          pedidos: 0,
          conversaciones: 0
        }
      })
    }
    
    // Si es operador, filtrar por su tipo de responsabilidad
    if (req.user!.rol === 'operador' && req.user!.tipoOperador) {
      filtro = { responsable: req.user!.tipoOperador }
    }
    
    // Administrador ve todos los clientes (filtro vacío)
    
    const totalClientes = await Cliente.countDocuments(filtro)
    const clientesHogar = await Cliente.countDocuments({ ...filtro, tipoCliente: 'hogar' })
    const clientesNegocio = await Cliente.countDocuments({ ...filtro, tipoCliente: { $ne: 'hogar' } })
    
    // Filtrar pedidos también por operador
    let totalPedidos = 0
    if (req.user!.rol === 'operador' && req.user!.tipoOperador) {
      const clientesAsignados = await Cliente.find(filtro, { telefono: 1 }).lean()
      const telefonos = clientesAsignados.map(c => c.telefono)
      
      if (telefonos.length > 0) {
        totalPedidos = await Pedido.countDocuments({ telefono: { $in: telefonos } })
      }
    } else {
      totalPedidos = await Pedido.countDocuments({})
    }
    
    const totalConversaciones = await Conversacion.countDocuments()

    // Clientes registrados hoy
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const clientesHoy = await Cliente.countDocuments({
      ...filtro,
      fechaRegistro: { $gte: hoy }
    })

    res.json({
      success: true,
      data: {
        clientes: {
          total: totalClientes,
          hogar: clientesHogar,
          negocio: clientesNegocio,
          hoy: clientesHoy,
        },
        pedidos: totalPedidos,
        conversaciones: totalConversaciones,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error obteniendo estadísticas',
    })
  }
})

// Finalmente, servir archivos estáticos (login.html, app.js, styles.css, etc.)
app.use(express.static(join(__dirname, '../public')))

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🌐 Dashboard disponible en: http://localhost:${PORT}`)
  console.log(`📡 API disponible en: http://localhost:${PORT}/api`)
})
