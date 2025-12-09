import express from 'express'
import cors from 'cors'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { connectDatabase } from './config/database.js'
import { config } from './config/environment.js'
import routes from './routes/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()

// Middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Middleware anti-caché
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  res.setHeader('Surrogate-Control', 'no-store')
  next()
})

// Conectar base de datos
connectDatabase()

// Rutas API
app.use('/api', routes)

// Servir archivos estáticos del frontend
const frontendPath = join(__dirname, '../../frontend/public')
app.use(express.static(frontendPath))

// Ruta principal - Dashboard
app.get('/', (req, res) => {
  res.sendFile(join(frontendPath, 'pages/index.html'))
})

// Ruta login
app.get('/login', (req, res) => {
  res.sendFile(join(frontendPath, 'pages/login.html'))
})

// Ruta reset password
app.get('/reset-password', (req, res) => {
  res.sendFile(join(frontendPath, 'pages/reset-password.html'))
})

// Manejo 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Ruta no encontrada' })
})

// Manejo de errores global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  res.status(500).json({ 
    success: false, 
    error: err.message || 'Error interno del servidor' 
  })
})

// Iniciar servidor
const port = config.port.api
app.listen(port, () => {
  console.log(`🚀 API Server running on port ${port}`)
  console.log(`📊 Dashboard: http://localhost:${port}`)
  console.log(`🔐 Login: http://localhost:${port}/login`)
})

export default app
