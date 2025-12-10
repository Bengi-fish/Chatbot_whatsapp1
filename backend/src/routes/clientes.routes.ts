import { Router, Response } from 'express'
import Cliente from '../models/Cliente.js'
import { verificarToken, adminOOperador, AuthRequest } from '../middleware/auth.js'

const router = Router()

// Obtener todos los clientes (con filtros según rol)
router.get('/', verificarToken, async (req: AuthRequest, res: Response) => {
  try {
    let filtro: any = {}
    
    console.log('🔍 [CLIENTES] Usuario:', req.user?.email, 'Rol:', req.user?.rol, 'TipoOperador:', req.user?.tipoOperador)
    
    // Soporte no debería ver clientes
    if (req.user!.rol === 'soporte') {
      return res.json({ success: true, total: 0, data: [] })
    }
    
    // Rol hogares solo ve clientes tipo 'hogar'
    if (req.user!.rol === 'hogares') {
      filtro = { tipoCliente: 'hogar' }
      console.log('🏠 [CLIENTES] Aplicando filtro hogares:', filtro)
    }
    
    // Si es operador, filtrar por su tipo de responsabilidad
    if (req.user!.rol === 'operador' && req.user!.tipoOperador) {
      filtro = { responsable: req.user!.tipoOperador }
      console.log('👔 [CLIENTES] Aplicando filtro operador:', filtro)
    }
    
    console.log('📊 [CLIENTES] Filtro final:', filtro)
    
    // Administrador ve todos los clientes (filtro vacío)
    const clientes = await Cliente.find(filtro).sort({ fechaRegistro: -1 })
    
    console.log('✅ [CLIENTES] Clientes encontrados:', clientes.length)
    
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

// Obtener un cliente por teléfono (solo admin y operador)
router.get('/:telefono', verificarToken, adminOOperador, async (req: AuthRequest, res: Response) => {
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

export default router
