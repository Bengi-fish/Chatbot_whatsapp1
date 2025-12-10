import * as dotenv from 'dotenv'
import { createBot, createProvider, createFlow } from '@builderbot/bot'
import { MongoAdapter } from '@builderbot/database-mongo'
import { MetaProvider as Provider } from '@builderbot/provider-meta'
import mongoose from 'mongoose'

// Importar todos los flows desde el índice
import {
  welcomeFlow,
  pedidoFlow,
  hogarFlow,
  hacerPedidoFlow,
  volverMenuFlow,
  negociosFlow,
  tiendasFlow,
  asaderosFlow,
  restaurantesEstandarFlow,
  restaurantePremiumFlow,
  mayoristasFlow,
  enviarInfoNegocioFlow,
  capturarDatosNegocioFlow,
  verCatalogoFlow,
  agregarProductosFlow,
  contactarAsesorFlow,
  encuentranosFlow,
  verUbicacionFlow,
  verSucursalesFlow,
  recetasFlow,
  recetasPolloFlow,
  recetasCarnesFlow,
  clienteFlow,
  infoGeneralFlow,
  actionRouterFlow,
  finalizarFlow,
  cancelarFlow,
  consultarPedidoFlow,
} from './flows/index.js'

dotenv.config()

const PORT = process.env.PORT ? Number(process.env.PORT) : 3008
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/avellano-chatbot'

const main = async () => {
  // Conectar Mongoose a MongoDB
  try {
    await mongoose.connect(MONGO_URI)
    console.log('✅ Mongoose conectado a MongoDB')
  } catch (error) {
    console.error('❌ Error conectando Mongoose a MongoDB:', error)
    process.exit(1)
  }

  // Configurar flows en orden de prioridad
  const adapterFlow = createFlow([
    welcomeFlow,
    pedidoFlow,
    hogarFlow,
    hacerPedidoFlow,
    volverMenuFlow,
    negociosFlow,
    tiendasFlow,
    asaderosFlow,
    restaurantePremiumFlow,
    restaurantesEstandarFlow,
    mayoristasFlow,
    enviarInfoNegocioFlow,
    verCatalogoFlow,
    contactarAsesorFlow,
    encuentranosFlow,
    verUbicacionFlow,
    verSucursalesFlow,
    recetasFlow,
    recetasPolloFlow,
    recetasCarnesFlow,
    clienteFlow,
    infoGeneralFlow,
    capturarDatosNegocioFlow,
    finalizarFlow,
    cancelarFlow,
    consultarPedidoFlow,
    actionRouterFlow,
  ])

  const adapterProvider = createProvider(Provider, {
    jwtToken: process.env.JWT_TOKEN,
    numberId: process.env.NUMBER_ID,
    verifyToken: process.env.VERIFY_TOKEN,
    version: process.env.PROVIDER_VERSION,
  })

  // Crear el adaptador de BD y esperar a que se conecte
  const adapterDB = new MongoAdapter({
    dbUri: MONGO_URI,
    dbName: 'avellano-chatbot',
  })

  // Esperar a que MongoAdapter esté realmente listo
  console.log('⏳ Esperando conexión de MongoAdapter...')
  await new Promise((resolve) => {
    const checkConnection = setInterval(() => {
      // Verificar si el adapter tiene la conexión lista
      if ((adapterDB as any).db && (adapterDB as any).db.collection) {
        clearInterval(checkConnection)
        resolve(true)
      }
    }, 100)
    
    // Timeout de seguridad de 10 segundos
    setTimeout(() => {
      clearInterval(checkConnection)
      resolve(true)
    }, 10000)
  })
  console.log('✅ MongoAdapter listo')

  const { httpServer } = await createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  })

  httpServer(PORT)
  console.log(`✅ Bot Avellano ejecutándose en el puerto ${PORT}`)
  console.log(`📊 Base de datos MongoDB conectada`)
}

main()
