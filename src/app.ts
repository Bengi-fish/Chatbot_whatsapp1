import * as dotenv from 'dotenv'
import { EVENTS, createBot, createProvider, createFlow, addKeyword, utils } from '@builderbot/bot'
import { join } from 'path'
import { MemoryDB as Database } from '@builderbot/bot'
import { MetaProvider as Provider } from '@builderbot/provider-meta'

dotenv.config()
const PORT = process.env.PORT ? Number(process.env.PORT) : 3008

// --- Flujos ---
const discordFlow = addKeyword<Provider, Database>('doc').addAnswer(
  [
    'You can see the documentation here:',
    '📄 https://builderbot.app/docs',
    '',
    'Do you want to continue? *yes*',
  ].join('\n'),
  { capture: true },
  async (_, { flowDynamic }) => {
    await flowDynamic('Thanks!')
  }
)

// --- Flujo de bienvenida automático ---
const welcomeFlow = addKeyword<Provider, Database>(EVENTS.WELCOME)
  .addAnswer('👋 ¡Hola! Bienvenido(a) a *Avellano*, donde alimentar es amar ❤️🐔')
  .addAnswer(
    [
      'Soy tu asistente virtual y estoy aquí para ayudarte.',
      '',
      'Por favor elige una opción para continuar 👇',
    ].join('\n'),
    {
      delay: 600,
      buttons: [
        { body: '🛒 pedido' },
        { body: '📖 Recetas' },
        { body: '📞 Atención' },
      ],
    }
  )

// --- Flujos secundarios ---
const pedidoFlow = addKeyword<Provider, Database>(['Realizar pedido', 'REALIZAR_PEDIDO', utils.setEvent('REALIZAR_PEDIDO')])
  .addAnswer('Perfecto 🛒, te ayudaré a realizar tu pedido.')

const recetasFlow = addKeyword<Provider, Database>(['Recetas', 'RECETAS', utils.setEvent('RECETAS')])
  .addAnswer('Aquí tienes nuestras recetas favoritas 👩‍🍳.')

const clienteFlow = addKeyword<Provider, Database>(['Atención al cliente', 'ATENCION_CLIENTE', utils.setEvent('ATENCION_CLIENTE')])
  .addAnswer('Nuestro equipo de soporte está aquí para ayudarte 💬.')

const fullSamplesFlow = addKeyword<Provider, Database>(['samples', utils.setEvent('SAMPLES')])
  .addAnswer(`💪 I'll send you some files...`)
  .addAnswer(`Send image from Local`, { media: join(process.cwd(), 'assets', 'sample.png') })
  .addAnswer(`Send video from URL`, {
    media: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYTJ0ZGdjd2syeXAwMjQ4aWdkcW04OWlqcXI3Ynh1ODkwZ25zZWZ1dCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LCohAb657pSdHv0Q5h/giphy.mp4',
  })
  .addAnswer(`Send audio from URL`, { media: 'https://cdn.freesound.org/previews/728/728142_11861866-lq.mp3' })
  .addAnswer(`Send file from URL`, {
    media: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  })

// --- Configuración principal ---
const main = async () => {
  const adapterFlow = createFlow([
    welcomeFlow,
    pedidoFlow,
    recetasFlow,
    clienteFlow,
    fullSamplesFlow,
    discordFlow,
  ])

  const adapterProvider = createProvider(Provider, {
    jwtToken: process.env.JWT_TOKEN,
    numberId: process.env.NUMBER_ID,
    verifyToken: process.env.VERIFY_TOKEN,
    version: process.env.PROVIDER_VERSION,
  })

  const adapterDB = new Database()

  const { handleCtx, httpServer } = await createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  })

  // Eliminamos el reenvío manual del mensaje de bienvenida.
  // El flujo de bienvenida (EVENTS.WELCOME) ya lo maneja automáticamente.

  adapterProvider.server.post(
    '/v1/samples',
    handleCtx(async (bot, req, res) => {
      const { number, name } = req.body
      await bot.dispatch('SAMPLES', { from: number, name })
      return res.end('trigger')
    })
  )

  adapterProvider.server.post(
    '/v1/blacklist',
    handleCtx(async (bot, req, res) => {
      const { number, intent } = req.body
      if (intent === 'remove') bot.blacklist.remove(number)
      if (intent === 'add') bot.blacklist.add(number)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ status: 'ok', number, intent }))
    })
  )

  httpServer(+PORT)
}

main()
