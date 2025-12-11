
### Software Necesario
- **Node.js** v18 o superior
- **MongoDB** v5.0 o superior (local o Atlas)
- **npm** o **yarn**
- **Git**# 📦 Manual de Instalación - Chatbot WhatsApp Avellano

## 📋 Requisitos Previos


### Cuentas y Servicios
- Cuenta de **Meta Business** (para WhatsApp Business API)
- Cuenta de **MongoDB Atlas** (opcional, si no usas MongoDB local)
- Cuenta de **SendGrid** (para envío de emails)
- Cuenta de **Vercel** o **Railway** (opcional, para deployment)

---

## 🚀 Instalación Local

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Nicolix16/Chatbot_whatsapp.git
cd Chatbot_whatsapp-1
```

### 2. Configurar Backend

#### 2.1 Navegar a la carpeta del backend
```bash
cd backend
```

#### 2.2 Instalar dependencias
```bash
npm install
```

#### 2.3 Crear archivo de variables de entorno
Crea un archivo `.env` en la carpeta `backend/` con el siguiente contenido:

```env
# MongoDB
MONGO_URI=mongodb://localhost:27017/avellano-chatbot

# WhatsApp Business API (Meta)
JWT_TOKEN=tu_token_jwt_de_meta
NUMBER_ID=tu_number_id_de_whatsapp
VERIFY_TOKEN=tu_verify_token_personalizado
PROVIDER_VERSION=v22.0

# Puerto del Bot
PORT=3008

# Puerto del API Server
API_PORT=3009

# JWT para autenticación de usuarios
JWT_SECRET=tu_clave_secreta_super_segura
JWT_REFRESH_SECRET=tu_clave_refresh_secreta

# SendGrid (para emails)
SENDGRID_API_KEY=tu_api_key_de_sendgrid
SENDGRID_FROM_EMAIL=noreply@avellano.com
SENDGRID_FROM_NAME=Avellano

# CORS (dominios permitidos)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:3009

# URLs del Frontend
FRONTEND_URL=http://localhost:5173
```

#### 2.4 Configurar MongoDB
Si usas MongoDB local:
```bash
# Iniciar MongoDB
mongod
```

Si usas MongoDB Atlas:
- Actualiza `MONGO_URI` con tu connection string de Atlas
- Ejemplo: `MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/avellano-chatbot`

#### 2.5 Crear usuario administrador inicial
```bash
npm run seed:user
```

Este comando crea un usuario administrador con:
- Email: `admin@avellano.com`
- Password: `Admin123!`

⚠️ **IMPORTANTE**: Cambia esta contraseña después del primer login.

### 3. Configurar Frontend

#### 3.1 Navegar a la carpeta del frontend
```bash
cd ../frontend-react
```

#### 3.2 Instalar dependencias
```bash
npm install
```

#### 3.3 Crear archivo de variables de entorno
Crea un archivo `.env` en la carpeta `frontend-react/` con:

```env
VITE_API_URL=http://localhost:3009/api
```

### 4. Ejecutar el Proyecto

#### Opción A: Usar scripts de inicio automático (Windows)

En la raíz del proyecto:
```bash
start-all.bat
```

Este script inicia automáticamente:
- Backend Bot (puerto 3008)
- Backend API (puerto 3009)
- Frontend (puerto 5173)

#### Opción B: Iniciar servicios manualmente

**Terminal 1 - Bot de WhatsApp:**
```bash
cd backend
npm run dev
```

**Terminal 2 - API Server:**
```bash
cd backend
npm run dev:dashboard
```

**Terminal 3 - Frontend:**
```bash
cd frontend-react
npm run dev
```

### 5. Verificar Instalación

- **Frontend**: http://localhost:5173
- **API**: http://localhost:3009
- **Bot WhatsApp**: http://localhost:3008

---

## 🔧 Configuración de WhatsApp Business API

### 1. Crear App en Meta Developers

1. Ve a https://developers.facebook.com/
2. Crea una nueva app de tipo "Business"
3. Agrega el producto "WhatsApp"

### 2. Obtener Credenciales

En el dashboard de WhatsApp:

1. **NUMBER_ID**: 
   - Ve a "Configuración de API"
   - Copia el "Phone Number ID"

2. **JWT_TOKEN**:
   - Ve a "Configuración de API"
   - Genera un token de acceso permanente

3. **VERIFY_TOKEN**:
   - Crea una cadena aleatoria (ej: `mi_token_secreto_123`)
   - Guárdala para configurar el webhook

### 3. Configurar Webhook

1. En "Configuración de Webhooks"
2. URL del webhook: `https://tu-dominio.com/webhook`
3. Verify Token: El mismo que pusiste en `.env`
4. Suscríbete a los eventos:
   - `messages`
   - `message_status`

---

## 📊 Configuración Inicial de la Base de Datos

### 1. Crear Encargado de Hogares
```bash
cd backend
npm run crear:encargado-hogares
```

### 2. (Opcional) Poblar con datos de prueba
```bash
npm run seed:pedidos
```

Para eliminar los datos de prueba:
```bash
npm run seed:pedidos:delete
```

---

## 👥 Gestión de Usuarios

### Roles Disponibles
- **administrador**: Acceso total
- **operador**: Gestión de pedidos y clientes asignados
- **hogares**: Gestión de clientes hogar
- **soporte**: Solo lectura

### Tipos de Operador
- `coordinador_masivos`: Para municipios del Meta
- `director_comercial`: Para tiendas, asaderos, restaurantes estándar en Villavicencio
- `ejecutivo_horecas`: Para restaurantes premium
- `mayorista`: Para mayoristas
- `encargado_hogares`: Para clientes hogar

### Crear Usuarios Adicionales

1. Inicia sesión como administrador
2. Ve a "Gestión de Usuarios"
3. Click en "Crear Usuario"
4. Completa el formulario
5. Asigna rol y tipo de operador (si aplica)

---

## 🐳 Deployment con Docker

### 1. Build de la imagen
```bash
docker build -t chatbot-avellano .
```

### 2. Ejecutar contenedor
```bash
docker run -p 3008:3008 -p 3009:3009 \
  --env-file .env \
  chatbot-avellano
```

### 3. Docker Compose (recomendado)
```bash
docker-compose up -d
```

---

## ☁️ Deployment en Vercel

### Backend
```bash
cd backend
vercel --prod
```

### Frontend
```bash
cd frontend-react
vercel --prod
```

Actualiza `VITE_API_URL` en el frontend con la URL de tu backend en Vercel.

---

## 🔒 Seguridad

### Cambiar Contraseñas por Defecto
1. Inicia sesión con `admin@avellano.com` / `Admin123!`
2. Ve a tu perfil
3. Cambia la contraseña

### Variables de Entorno Sensibles
⚠️ **NUNCA** subas el archivo `.env` a Git

Las siguientes variables son críticas:
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_TOKEN` (WhatsApp)
- `SENDGRID_API_KEY`
- `MONGO_URI` (si contiene credenciales)

### Generar Claves Seguras
```bash
# En Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🛠️ Scripts Útiles

### Backend
```bash
# Desarrollo
npm run dev                    # Iniciar bot
npm run dev:dashboard          # Iniciar API server

# Producción
npm run build                  # Build del bot
npm run build:server          # Build del servidor
npm start                     # Iniciar bot en producción
npm start:dashboard           # Iniciar servidor en producción

# Base de datos
npm run seed:user             # Crear admin
npm run seed:pedidos          # Datos de prueba
npm run crear:encargado-hogares  # Crear encargado hogares

# Utilidades
npm run lint                  # Verificar código
```

### Frontend
```bash
# Desarrollo
npm run dev                   # Iniciar en modo desarrollo

# Producción
npm run build                 # Build para producción
npm run preview               # Preview del build
```

---

## 📝 Logs y Monitoreo

### Ver Logs del Bot
```bash
cd backend
npm run dev
# Los logs aparecerán en consola
```

### Ver Logs del API
```bash
cd backend
npm run dev:dashboard
# Los logs aparecerán en consola
```

### Logs en Producción
Los logs se pueden ver en:
- **Vercel**: Dashboard → Project → Logs
- **Railway**: Dashboard → Project → Deploy Logs
- **Docker**: `docker logs <container-id>`

---

## ❓ Troubleshooting

### Error: Cannot connect to MongoDB
**Solución**: 
- Verifica que MongoDB esté corriendo
- Revisa la cadena de conexión en `MONGO_URI`

### Error: WhatsApp webhook not working
**Solución**:
- Verifica que `VERIFY_TOKEN` coincida en Meta y `.env`
- Asegúrate de que tu servidor sea accesible públicamente
- Usa ngrok para desarrollo local: `ngrok http 3008`

### Error: 403 Forbidden en API
**Solución**:
- Verifica que el token JWT sea válido
- Revisa que el usuario tenga los permisos necesarios
- Asegúrate de que el rol del usuario sea correcto

### Frontend no puede conectar con Backend
**Solución**:
- Verifica `VITE_API_URL` en el `.env` del frontend
- Revisa que `ALLOWED_ORIGINS` incluya la URL del frontend
- Asegúrate de que el backend esté corriendo

---

## 📚 Documentación Adicional

- [Estructura del Proyecto](ESTRUCTURA_PROYECTO.md)
- [Guía de Inicio Rápido](QUICK_START.md)
- [Configuración de Variables de Entorno](ENV_CONFIG.md)
- [Deployment](DEPLOYMENT.md)

---

## 🤝 Soporte

Para problemas o dudas:
1. Revisa la documentación
2. Verifica los logs
3. Contacta al equipo de desarrollo

---

## 📄 Licencia

Este proyecto es privado y confidencial.

---

**Última actualización**: Diciembre 11, 2025
