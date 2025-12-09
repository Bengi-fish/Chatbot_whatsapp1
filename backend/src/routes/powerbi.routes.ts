import { Router, Response } from 'express'
import Cliente from '../models/Cliente.js'
import Pedido from '../models/Pedido.js'
import Conversacion from '../models/Conversacion.js'
import { verificarToken, AuthRequest } from '../middleware/auth.js'

const router = Router()

// Estadísticas generales (todos los usuarios autenticados pueden ver)
router.get('/stats', verificarToken, async (req: AuthRequest, res: Response) => {
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

// Endpoint para exportar clientes (Power BI)
router.get('/clientes', verificarToken, async (req: AuthRequest, res: Response) => {
  try {
    let filtro: any = {}
    
    // Filtrar por tipo de operador
    if (req.user!.rol === 'operador' && req.user!.tipoOperador) {
      filtro = { responsable: req.user!.tipoOperador }
    }
    
    const clientes = await Cliente.find(filtro).lean()
    
    res.json({
      success: true,
      total: clientes.length,
      fecha_exportacion: new Date().toISOString(),
      data: clientes
    })
  } catch (error) {
    console.error('Error exportando clientes:', error)
    res.status(500).json({
      success: false,
      error: 'Error exportando clientes para Power BI'
    })
  }
})

// Endpoint para exportar pedidos (Power BI)
router.get('/pedidos', verificarToken, async (req: AuthRequest, res: Response) => {
  try {
    let pedidos = []
    
    // Si es operador, filtrar por clientes asignados
    if (req.user!.rol === 'operador' && req.user!.tipoOperador) {
      const clientesAsignados = await Cliente.find({ responsable: req.user!.tipoOperador }, { telefono: 1 }).lean()
      const telefonos = clientesAsignados.map(c => c.telefono)
      
      if (telefonos.length > 0) {
        pedidos = await Pedido.find({ telefono: { $in: telefonos } }).lean()
      }
    } else {
      pedidos = await Pedido.find({}).lean()
    }
    
    res.json({
      success: true,
      total: pedidos.length,
      fecha_exportacion: new Date().toISOString(),
      data: pedidos
    })
  } catch (error) {
    console.error('Error exportando pedidos:', error)
    res.status(500).json({
      success: false,
      error: 'Error exportando pedidos para Power BI'
    })
  }
})

// Endpoint para exportar conversaciones (Power BI)
router.get('/conversaciones', verificarToken, async (req: AuthRequest, res: Response) => {
  try {
    const conversaciones = await Conversacion.find({}).lean()
    
    res.json({
      success: true,
      total: conversaciones.length,
      fecha_exportacion: new Date().toISOString(),
      data: conversaciones
    })
  } catch (error) {
    console.error('Error exportando conversaciones:', error)
    res.status(500).json({
      success: false,
      error: 'Error exportando conversaciones para Power BI'
    })
  }
})

// Endpoint para exportar estadísticas agregadas (Power BI)
router.get('/estadisticas', verificarToken, async (req: AuthRequest, res: Response) => {
  try {
    let filtroClientes: any = {}
    
    // Filtrar por tipo de operador
    if (req.user!.rol === 'operador' && req.user!.tipoOperador) {
      filtroClientes = { responsable: req.user!.tipoOperador }
    }
    
    // Estadísticas de clientes
    const totalClientes = await Cliente.countDocuments(filtroClientes)
    const clientesPorTipo = await Cliente.aggregate([
      { $match: filtroClientes },
      { $group: { _id: '$tipoCliente', count: { $sum: 1 } } }
    ])
    
    // Estadísticas de pedidos
    let estadisticasPedidos: any = {}
    
    if (req.user!.rol === 'operador' && req.user!.tipoOperador) {
      const clientesAsignados = await Cliente.find(filtroClientes, { telefono: 1 }).lean()
      const telefonos = clientesAsignados.map(c => c.telefono)
      
      if (telefonos.length > 0) {
        estadisticasPedidos = await Pedido.aggregate([
          { $match: { telefono: { $in: telefonos } } },
          {
            $group: {
              _id: '$estado',
              count: { $sum: 1 },
              total: { $sum: '$total' }
            }
          }
        ])
      }
    } else {
      estadisticasPedidos = await Pedido.aggregate([
        {
          $group: {
            _id: '$estado',
            count: { $sum: 1 },
            total: { $sum: '$total' }
          }
        }
      ])
    }
    
    // Pedidos por mes (últimos 12 meses)
    const hace12Meses = new Date()
    hace12Meses.setMonth(hace12Meses.getMonth() - 12)
    
    const pedidosPorMes = await Pedido.aggregate([
      { $match: { fecha: { $gte: hace12Meses } } },
      {
        $group: {
          _id: {
            año: { $year: '$fecha' },
            mes: { $month: '$fecha' }
          },
          count: { $sum: 1 },
          total: { $sum: '$total' }
        }
      },
      { $sort: { '_id.año': 1, '_id.mes': 1 } }
    ])
    
    res.json({
      success: true,
      fecha_exportacion: new Date().toISOString(),
      data: {
        clientes: {
          total: totalClientes,
          por_tipo: clientesPorTipo
        },
        pedidos: {
          por_estado: estadisticasPedidos,
          por_mes: pedidosPorMes
        }
      }
    })
  } catch (error) {
    console.error('Error exportando estadísticas:', error)
    res.status(500).json({
      success: false,
      error: 'Error exportando estadísticas para Power BI'
    })
  }
})

export default router
