import { addKeyword, EVENTS } from '@builderbot/bot'
import { MetaProvider as Provider } from '@builderbot/provider-meta'
import { MongoAdapter } from '@builderbot/database-mongo'
import { reiniciarTemporizador } from './utils/temporizador.js'
import { verificarAceptacionPoliticas } from './privacidad.flow.js'
import Cliente from '../models/Cliente.js'

type Database = typeof MongoAdapter

export const welcomeFlow = addKeyword<Provider, Database>([
  EVENTS.WELCOME,
  'hola',
  'Hola',
  'menu',
  'menú'
]).addAction(async (ctx, { flowDynamic, state }) => {
  const user = ctx.from
  await reiniciarTemporizador(user, flowDynamic)
  
  const myState = state.getMyState() || {}
  
  // Verificar si el usuario ha aceptado las políticas de privacidad
  // Primero verificar estado de sesión, luego base de datos
  let politicasAceptadas = myState.politicasAceptadas || false
  
  if (!politicasAceptadas) {
    politicasAceptadas = await verificarAceptacionPoliticas(user)
  }
  
  if (!politicasAceptadas) {
    console.log('⚠️ Usuario sin políticas aceptadas, mostrando política de privacidad')
    
    await state.update({ 
      esperandoAceptacionPoliticas: true,
      desdeWelcome: true
    })
    
    // Mostrar política directamente
    await flowDynamic([
      {
        body: [
          '📋 *POLÍTICA DE TRATAMIENTO DE DATOS PERSONALES*',
          '',
          'De acuerdo con la Ley 1581 de 2012 y el Decreto 1377 de 2013 sobre Habeas Data en Colombia, solicitamos tu autorización para:',
          '',
          '✅ *Recolectar y almacenar* tus datos personales (nombre, teléfono, dirección, ciudad)',
          '',
          '✅ *Utilizar* tu información para:',
          '  • Gestionar pedidos y entregas',
          '  • Enviarte actualizaciones de productos',
          '  • Mejorar nuestro servicio',
          '',
          '✅ *Compartir* tus datos únicamente con:',
          '  • Personal autorizado de Avellano',
          '  • Coordinadores de zona para entregas',
          '',
          '📌 *TUS DERECHOS:*',
          '• Conocer, actualizar y rectificar tus datos',
          '• Solicitar prueba de autorización',
          '• Ser informado sobre el uso de tus datos',
          '• Revocar autorización (Art. 8 Ley 1581/2012)',
          '• Presentar quejas ante la SIC',
          '',
          '🔒 Tus datos están protegidos y no serán vendidos ni compartidos con terceros no autorizados.',
        ].join('\n'),
        buttons: [
          { body: '✅ Acepto' },
          { body: '❌ No acepto' },
        ],
      },
    ])
    
    return // Detener aquí y esperar respuesta
  }

  await flowDynamic([
    {
      body: [
        '👋 ¡Hola! Bienvenido(a) a Avellano',
        '',
        'Soy tu asistente virtual  y estoy aquí para ayudarte.',
        'Por favor elige una opción para continuar:',
      ].join('\n'),
      buttons: [
        { body: '🛒 Pedido' },
        { body: '📖 Recetas' },
        { body: '📞 Atención' },
      ],
    },
  ])

  await flowDynamic([
    {
      body: '¿Necesitas consultar el estado de tu pedido? Aquí puedes hacerlo:',
      buttons: [
        { body: 'Consultar' },
      ],
    },
  ])
})
.addAnswer(
  '',
  { capture: true },
  async (ctx, { flowDynamic, state, endFlow }) => {
    const myState = state.getMyState() || {}
    
    // Solo procesar si estamos esperando aceptación de políticas
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
          // Si el cliente ya existe, actualizar aceptación
          cliente.politicasAceptadas = true
          cliente.fechaAceptacionPoliticas = new Date()
          await cliente.save()
        }
        // Si no existe, solo guardamos en el estado
        // El cliente se creará cuando elija Hogar o Negocios
        
        await state.update({ 
          esperandoAceptacionPoliticas: false,
          politicasAceptadas: true,
          politicasAceptadasFecha: new Date()
        })
        
        await flowDynamic([
          '✅ *Gracias por aceptar nuestras políticas*',
          '',
          'Ahora puedes continuar.',
        ].join('\n'))
        
        // Mostrar menú principal
        await flowDynamic([
          {
            body: [
              '👋 ¡Hola! Bienvenido(a) a Avellano',
              '',
              'Soy tu asistente virtual y estoy aquí para ayudarte.',
              'Por favor elige una opción para continuar:',
            ].join('\n'),
            buttons: [
              { body: '🛒 Pedido' },
              { body: '📖 Recetas' },
              { body: '📞 Atención' },
            ],
          },
        ])
        
        await flowDynamic([
          {
            body: '¿Necesitas consultar el estado de tu pedido? Aquí puedes hacerlo:',
            buttons: [
              { body: 'Consultar' },
            ],
          },
        ])
        
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
        'Si cambias de opinión, escribe *"hola"* para revisar y aceptar.',
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