import { Router } from 'express'
import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Usuario from '../models/Usuario.js'
import { config } from '../config/environment.js'
import sgMail from '@sendgrid/mail'
import { verificarToken } from '../middleware/auth.js'

const router = Router()

// Configurar SendGrid
if (config.sendgrid.apiKey) {
  sgMail.setApiKey(config.sendgrid.apiKey)
}

// Funciones para generar tokens
function generateAccessToken(payload: any) {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: '15m' })
}

function generateRefreshToken(payload: any) {
  return jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: '7d' })
}

// Registro
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, rol, nombre } = req.body
    
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email y password requeridos' })
    }
    
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
        id: user._id.toString(),
        email: user.email,
        rol: user.rol,
        tipoOperador: user.tipoOperador,
        nombre: user.nombre,
        activo: user.activo
      }
    })
  } catch (e) {
    res.status(500).json({ success: false, error: 'Error registrando usuario' })
  }
})

// Login
router.post('/login', async (req: Request, res: Response) => {
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
        id: user._id.toString(),
        email: user.email,
        rol: user.rol,
        tipoOperador: user.tipoOperador,
        nombre: user.nombre,
        activo: user.activo
      }
    })
  } catch (e) {
    res.status(500).json({ success: false, error: 'Error en login' })
  }
})

// Refresh token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) return res.status(401).json({ success: false, error: 'Refresh token requerido' })
    
    const payload = jwt.verify(refreshToken, config.jwt.refreshSecret) as any
    
    const user = await Usuario.findById(payload.uid)
    if (!user || user.refreshToken !== refreshToken || !user.activo) {
      return res.status(401).json({ success: false, error: 'Refresh token inválido' })
    }
    
    const newPayload = { 
      uid: user._id, 
      email: user.email, 
      rol: user.rol,
      tipoOperador: user.tipoOperador,
      nombre: user.nombre 
    }
    const newAccessToken = generateAccessToken(newPayload)
    const newRefreshToken = generateRefreshToken(newPayload)
    
    user.refreshToken = newRefreshToken
    await user.save()
    
    res.json({ 
      success: true, 
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
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

// Logout
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const auth = req.headers.authorization || ''
    const [, token] = auth.split(' ')
    
    if (token) {
      const payload = jwt.verify(token, config.jwt.secret) as any
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

// Obtener usuario actual
router.get('/me', verificarToken, async (req: any, res: Response) => {
  try {
    const user = await Usuario.findById(req.user.uid).select('-passwordHash -refreshToken')
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' })
    }
    res.json({ success: true, user })
  } catch (e) {
    res.status(500).json({ success: false, error: 'Error obteniendo usuario' })
  }
})

// Solicitar recuperación de contraseña
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body
    
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email requerido' })
    }

    const user = await Usuario.findOne({ email: email.toLowerCase() })
    
    if (!user) {
      return res.json({ 
        success: true, 
        message: 'Si el correo existe, recibirás un enlace de recuperación' 
      })
    }

    const resetToken = jwt.sign(
      { uid: user._id, email: user.email },
      config.jwt.secret,
      { expiresIn: '1h' }
    )

    user.resetPasswordToken = resetToken
    user.resetPasswordExpires = new Date(Date.now() + 3600000)
    await user.save()

    const resetUrl = `${config.frontend.url}/reset-password.html?token=${resetToken}`

    if (config.sendgrid.apiKey) {
      const msg = {
        to: user.email,
        from: { email: config.sendgrid.fromEmail, name: 'Avellano' },
        subject: 'Recuperación de Contraseña',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Recuperación de Contraseña</h2>
            <p>Hola ${user.nombre},</p>
            <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace:</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a>
            <p>Este enlace expirará en 1 hora.</p>
            <p>Si no solicitaste esto, ignora este correo.</p>
          </div>
        `
      }

      await sgMail.send(msg)
    } else {
      console.log(`📧 [DEV] Email de recuperación: ${resetUrl}`)
    }

    res.json({ 
      success: true, 
      message: 'Si el correo existe, recibirás un enlace de recuperación' 
    })
  } catch (e: any) {
    console.error('Error en forgot-password:', e)
    res.status(500).json({ success: false, error: 'Error procesando solicitud' })
  }
})

// Resetear contraseña
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body
    
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, error: 'Token y nueva contraseña requeridos' })
    }

    const payload = jwt.verify(token, config.jwt.secret) as any
    const user = await Usuario.findById(payload.uid)
    
    if (!user || user.resetPasswordToken !== token) {
      return res.status(401).json({ success: false, error: 'Token inválido o expirado' })
    }

    if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
      return res.status(401).json({ success: false, error: 'Token expirado' })
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10)
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    user.refreshToken = undefined
    await user.save()

    res.json({ success: true, message: 'Contraseña actualizada exitosamente' })
  } catch (e) {
    console.error('Error en reset-password:', e)
    res.status(401).json({ success: false, error: 'Token inválido o expirado' })
  }
})

export default router
