import * as dotenv from 'dotenv'
import { EVENTS, createBot, createProvider, createFlow, addKeyword, utils } from '@builderbot/bot'
import { join } from 'path'
import { MemoryDB as Database } from '@builderbot/bot'
import { MetaProvider as Provider } from '@builderbot/provider-meta'

dotenv.config()
const PORT = process.env.PORT ? Number(process.env.PORT) : 3008

//  Tiempo de inactividad
const TIEMPO_INACTIVIDAD =60*1000*1         //1 min ( cambiar)

//  Mensaje de cierre
const mensajeCierre = [
  '💛 Gracias por contactar a *Avellano*.',
  '¡Recuerda que alimentar es amar! 🐔',
  'Te esperamos pronto.',
].join('\n')

// Mapa para manejar temporizadores por usuario
const temporizadores = new Map<string, NodeJS.Timeout>()

// 📋 Función para reiniciar temporizador
async function reiniciarTemporizador(user: string, flowDynamic: any) {
  if (temporizadores.has(user)) clearTimeout(temporizadores.get(user)!)
  const timer = setTimeout(async () => {
    await flowDynamic(mensajeCierre)
    temporizadores.delete(user)
  }, TIEMPO_INACTIVIDAD)
  temporizadores.set(user, timer)
}

// 📌 Flujo principal de bienvenida
const welcomeFlow = addKeyword<Provider, Database>([EVENTS.WELCOME]).addAction(
  async (ctx, { flowDynamic }) => {
    const user = ctx.from

    // Siempre reinicia temporizador
    await reiniciarTemporizador(user, flowDynamic)

    // Enviar menú principal
    await flowDynamic([
      {
        body: [
          '👋 ¡Hola! Bienvenido(a) a *Avellano*, donde alimentar es amar 💖🐔',
          '',
          'Soy tu asistente virtual y estoy aquí para ayudarte.',
          'Por favor elige una opción para continuar 👇',
        ].join('\n'),
        buttons: [
          { body: '🛒 pedido' },
          { body: '📖 Recetas' },
          { body: '📞 Atención' },
        ],
      },
    ])
  }
)

// 🛒 Flujo para realizar pedido
const pedidoFlow = addKeyword<Provider, Database>(['🛒 Realizar pedido']).addAction(
  async (ctx, { flowDynamic }) => {
    await flowDynamic('Perfecto 🛒, te ayudaré a realizar tu pedido.')
  }
)

// 📖 Flujo de recetas
const recetasFlow = addKeyword<Provider, Database>(['📖 Recetas']).addAction(
  async (ctx, { flowDynamic }) => {
    await flowDynamic('Aquí tienes nuestras recetas favoritas 👩‍🍳.')
  }
)

// ☎️ Flujo de atención al cliente
const clienteFlow = addKeyword<Provider, Database>(['📞 Atención al cliente']).addAction(
  async (ctx, { flowDynamic }) => {
    await flowDynamic('Nuestro equipo de soporte está aquí para ayudarte 💬.')
  }
)



// 🔧 Configuración del bot
const main = async () => {
  const adapterFlow = createFlow([welcomeFlow, pedidoFlow, recetasFlow, clienteFlow])

  const adapterProvider = createProvider(Provider, {
    jwtToken: process.env.JWT_TOKEN,
    numberId: process.env.NUMBER_ID,
    verifyToken: process.env.VERIFY_TOKEN,
    version: process.env.PROVIDER_VERSION,
  })

  const adapterDB = new Database()

  const { httpServer } = await createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  })

  httpServer(PORT)
  console.log(`✅ Bot Avellano ejecutándose en el puerto ${PORT}`)
}

main()
