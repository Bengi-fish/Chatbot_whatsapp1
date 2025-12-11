import { addKeyword } from '@builderbot/bot'
import { MetaProvider as Provider } from '@builderbot/provider-meta'
import { MongoAdapter } from '@builderbot/database-mongo'
import Cliente from '../models/Cliente.js'

type Database = typeof MongoAdapter

// Texto de la política de privacidad y tratamiento de datos
const POLITICA_PRIVACIDAD = `
 *POLÍTICA DE TRATAMIENTO DE DATOS PERSONALES*

De acuerdo con la Ley 1581 de 2012 y el Decreto 1377 de 2013 sobre Habeas Data en Colombia, solicitamos tu autorización para:

 *Recolectar y almacenar* tus datos personales (nombre, teléfono, dirección, ciudad)

 *Utilizar* tu información para:
   • Gestionar pedidos y entregas
   • Enviarte actualizaciones de productos
   • Mejorar nuestro servicio

 *Compartir* tus datos únicamente con:
   • Personal autorizado de Avellano
   • Coordinadores de zona para entregas

📌 *TUS DERECHOS:*
• Conocer, actualizar y rectificar tus datos
• Solicitar prueba de autorización
• Ser informado sobre el uso de tus datos
• Revocar autorización (Art. 8 Ley 1581/2012)
• Presentar quejas ante la SIC

🔒 Tus datos están protegidos y no serán vendidos ni compartidos con terceros no autorizados.

Para más información, consulta nuestra política completa en: [URL política]
`.trim()

// Verificar si el usuario ya aceptó las políticas
export async function verificarAceptacionPoliticas(telefono: string): Promise<boolean> {
  try {
    const cliente = await Cliente.findOne({ telefono })
    if (cliente?.politicasAceptadas) {
      return true
    }
    return false
  } catch (error) {
    console.error('Error verificando políticas:', error)
    return false
  }
}

// Flow para solicitar aceptación de políticas
export const politicasFlow = addKeyword<Provider, Database>([
  'INICIAR_POLITICAS',
  '📄 Ver política',
  'Ver política',
  'ver politica',
  'política',
  'politica'
])
.addAction(async (ctx, { flowDynamic, state }) => {
  await flowDynamic([
    {
      body: POLITICA_PRIVACIDAD,
      buttons: [
        { body: '✅ Acepto' },
        { body: '❌ No acepto' },
      ],
    },
  ])
  
  await state.update({ esperandoAceptacionPoliticas: true })
})
.addAnswer(
  '',
  { capture: true },
  async (ctx, { flowDynamic, state, endFlow, gotoFlow }) => {
    const myState = state.getMyState() || {}
    
    if (!myState.esperandoAceptacionPoliticas) {
      return
    }
    
    const texto = ctx.body.toLowerCase().trim()
    const buttonReply = (ctx as any).title_button_reply?.toLowerCase() || ''
    
    const acepto = 
      texto.includes('acepto') ||
      texto.includes('si') ||
      texto.includes('sí') ||
      buttonReply.includes('acepto')
    
    const noAcepto = 
      texto.includes('no acepto') ||
      texto === 'no' ||
      buttonReply.includes('no acepto')
    
    if (acepto) {
      // Guardar aceptación
      const user = ctx.from
      try {
        let cliente = await Cliente.findOne({ telefono: user })
        
        if (cliente) {
          cliente.politicasAceptadas = true
          cliente.fechaAceptacionPoliticas = new Date()
        } else {
          cliente = new Cliente({
            telefono: user,
            politicasAceptadas: true,
            fechaAceptacionPoliticas: new Date(),
            fechaRegistro: new Date(),
          })
        }
        
        await cliente.save()
        
        await state.update({ 
          esperandoAceptacionPoliticas: false,
          politicasAceptadas: true 
        })
        
        const myState = state.getMyState() || {}
        
        await flowDynamic([
          '✅ *Gracias por aceptar nuestras políticas*',
          '',
          'Ahora puedes continuar con tu registro.',
          '',
          'Recuerda que puedes ejercer tus derechos contactándonos en cualquier momento.',
        ].join('\n'))
        
        // Si viene del welcome, redirigir al menú principal
        if (myState.requiereRedireccionMenu) {
          await state.update({ requiereRedireccionMenu: false })
          
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          const { actionRouterFlow } = await import('./router.flow.js')
          return gotoFlow(actionRouterFlow)
        }
        
      } catch (error) {
        console.error('Error guardando aceptación:', error)
        await flowDynamic('❌ Error al guardar. Por favor intenta de nuevo.')
      }
      
    } else if (noAcepto) {
      await state.update({ esperandoAceptacionPoliticas: false })
      
      await flowDynamic([
        '❌ *No podemos continuar sin tu autorización*',
        '',
        'De acuerdo con la Ley 1581 de 2012, necesitamos tu consentimiento para procesar tus datos personales.',
        '',
        '⚠️ *Sin esta autorización:*',
        '• No podemos registrar tus pedidos',
        '• No podemos enviarte información',
        '• No podemos procesar entregas',
        '',
        'Si cambias de opinión, escribe *"Políticas"* para revisar y aceptar.',
        '',
        'Gracias por tu comprensión. 👋',
      ].join('\n'))
      
      return endFlow()
    } else {
      await flowDynamic([
        'Por favor responde:',
        '✅ *"Acepto"* para autorizar',
        '❌ *"No acepto"* para rechazar',
      ].join('\n'))
    }
  }
)

// Flow para revocar autorización
export const revocarAutorizacionFlow = addKeyword<Provider, Database>([
  'revocar',
  'eliminar datos',
  'borrar datos',
  'eliminar mi información',
  '❌ Revocar',
  'Revocar'
]).addAction(async (ctx, { flowDynamic }) => {
  await flowDynamic([
    {
      body: [
        '⚠️ *REVOCAR AUTORIZACIÓN DE TRATAMIENTO DE DATOS*',
        '',
        'Si revocas tu autorización:',
        '• Eliminaremos tu información personal',
        '• No podrás hacer pedidos',
        '• Perderás tu historial',
        '',
        '¿Estás seguro de continuar?',
      ].join('\n'),
      buttons: [
        { body: '✅ Sí, revocar' },
        { body: '❌ Cancelar' },
      ],
    },
  ])
})
.addAnswer(
  '',
  { capture: true },
  async (ctx, { flowDynamic, endFlow }) => {
    const texto = ctx.body.toLowerCase().trim()
    const buttonReply = (ctx as any).title_button_reply?.toLowerCase() || ''
    
    const confirmaRevocacion = 
      texto.includes('sí') ||
      texto.includes('si') ||
      buttonReply.includes('sí, revocar')
    
    if (confirmaRevocacion) {
      const user = ctx.from
      
      try {
        const cliente = await Cliente.findOne({ telefono: user })
        
        if (cliente) {
          // Marcar como revocado en lugar de eliminar (para auditoría)
          cliente.politicasAceptadas = false
          cliente.politicasRevocadas = true
          cliente.fechaRevocacion = new Date()
          cliente.estado = 'inactivo'
          await cliente.save()
          
          await flowDynamic([
            '✅ *Autorización revocada exitosamente*',
            '',
            'Tus datos han sido marcados como inactivos y no serán utilizados.',
            '',
            'Conservaremos un registro mínimo por obligaciones legales (facturación, etc.) según el Art. 21 de la Ley 1581.',
            '',
            'Si deseas eliminar completamente tus datos, contacta:',
            ' protecciondatos@avellano.com',
        
          ].join('\n'))
        } else {
          await flowDynamic('No encontramos datos registrados con este número.')
        }
      } catch (error) {
        console.error('Error revocando autorización:', error)
        await flowDynamic('❌ Error al procesar. Contacta soporte.')
      }
      
      return endFlow()
    } else {
      await flowDynamic([
        '❌ *Cancelado*',
        '',
        'Tu autorización sigue activa.',
        'Tus datos continúan protegidos. 🔒',
      ].join('\n'))
    }
  }
)

// Flow para consultar datos almacenados
export const consultarDatosFlow = addKeyword<Provider, Database>([
  'mis datos',
  'consultar datos',
  'ver mis datos',
  'qué datos tienen',
  '📋 Consultar datos',
  'Consultar datos'
]).addAction(async (ctx, { flowDynamic }) => {
  const user = ctx.from
  
  try {
    const cliente = await Cliente.findOne({ telefono: user })
    
    if (!cliente) {
      await flowDynamic('No tenemos datos registrados con este número.')
      return
    }
    
    await flowDynamic([
      '📋 *TUS DATOS ALMACENADOS:*',
      '',
      `📱 *Teléfono:* ${cliente.telefono}`,
      `👤 *Nombre:* ${cliente.nombre || 'No registrado'}`,
      `🏢 *Tipo cliente:* ${cliente.tipoCliente || 'No registrado'}`,
      `🏙️ *Ciudad:* ${cliente.ciudad || 'No registrada'}`,
      `📍 *Dirección:* ${cliente.direccion || 'No registrada'}`,
      `📅 *Fecha registro:* ${cliente.fechaRegistro ? new Date(cliente.fechaRegistro).toLocaleDateString('es-CO') : 'N/A'}`,
      `✅ *Políticas aceptadas:* ${cliente.politicasAceptadas ? 'Sí' : 'No'}`,
      cliente.fechaAceptacionPoliticas ? `📆 *Fecha aceptación:* ${new Date(cliente.fechaAceptacionPoliticas).toLocaleDateString('es-CO')}` : '',
      '',
      '🔄 Para actualizar tus datos, escribe *"Actualizar datos"*',
      '🗑️ Para eliminar tus datos, escribe *"Revocar"*',
    ].filter(Boolean).join('\n'))
    
  } catch (error) {
    console.error('Error consultando datos:', error)
    await flowDynamic('❌ Error al consultar. Intenta más tarde.')
  }
})

export default { 
  politicasFlow, 
  revocarAutorizacionFlow, 
  consultarDatosFlow,
  verificarAceptacionPoliticas 
}
