# Chatbot Avellano - WhatsApp Business

Sistema de chatbot para WhatsApp integrado con panel de administración web moderno.

## 🏗️ Arquitectura del Proyecto

```
chatbot-avellano/
├── backend/                    # 🔧 Servidor API Node.js + TypeScript
│   ├── src/
│   │   ├── models/            # Modelos Mongoose (Usuario, Cliente, Pedido, etc.)
│   │   ├── middleware/        # Auth JWT, permisos, rate limiting
│   │   ├── flows/             # Flujos conversacionales del bot
│   │   ├── scripts/           # Seeds y migraciones
│   │   ├── app.ts             # Bot de WhatsApp (BuilderBot)
│   │   └── server.ts          # API REST (Express)
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                   # Configuración del backend
│
├── frontend-react/             # ⚛️ Dashboard React (ACTIVO)
│   ├── src/
│   │   ├── pages/             # Páginas (Login, Dashboard, etc.)
│   │   ├── components/        # Componentes React reutilizables
│   │   ├── contexts/          # Context API (Auth, Theme)
│   │   ├── services/          # Servicios API (auth, clientes, pedidos)
│   │   ├── types/             # TypeScript types
│   │   └── config/            # Configuración API
│   ├── package.json
│   ├── vite.config.ts
│   └── .env                   # VITE_API_URL
│
├── frontend/                   # ⚠️ Frontend antiguo (DEPRECADO)
│   └── public/                # HTML estático (ya no se usa)
│
├── src/                       # 🤖 Código del bot WhatsApp (raíz)
│   └── flows/                 # Flujos compartidos
│
├── docker-compose.yml
├── Dockerfile
└── README.md
```

## 🚀 Instalación y Ejecución

### Requisitos Previos

- Node.js 18+ o superior
- MongoDB Atlas (cloud) o MongoDB local
- Cuenta de WhatsApp Business API
- npm o pnpm

### 1️⃣ Configuración del Backend (API)

```bash
cd backend
npm install
```

**Crear archivo `backend/.env`:**
```env
# Puertos
PORT=3008           # Bot WhatsApp
API_PORT=3009       # API REST

# MongoDB Atlas
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/chatbot?retryWrites=true&w=majority

# JWT Secrets (generar con: openssl rand -hex 64)
JWT_SECRET=tu_secret_super_seguro_cambiar_en_produccion
JWT_REFRESH_SECRET=tu_refresh_secret_super_seguro_cambiar_en_produccion

# WhatsApp Business API
JWT_TOKEN=tu_token_de_whatsapp_business
NUMBER_ID=tu_numero_id_whatsapp
VERIFY_TOKEN=tu_verify_token
PROVIDER_VERSION=v22.0

# SendGrid (para recuperación de contraseña)
SENDGRID_API_KEY=tu_api_key_de_sendgrid
SENDGRID_FROM_EMAIL=noreply@avellano.com

# Frontend React
FRONTEND_URL=http://localhost:5173

# CORS
ALLOWED_ORIGINS=http://localhost:5173

# Entorno
NODE_ENV=development
```

**Crear usuario administrador:**
```bash
npm run seed:user -- --email=admin@avellano.com --password=admin123 --rol=admin
```

### 2️⃣ Configuración del Frontend (React)

```bash
cd frontend-react
npm install
```

**Crear archivo `frontend-react/.env`:**
```env
VITE_API_URL=http://localhost:3009/api
```

### 🎯 Ejecución en Desarrollo

**Terminal 1 - Backend API:**
```bash
cd backend
npm run dev:dashboard    # Inicia API REST en puerto 3009
```

**Terminal 2 - Frontend React:**
```bash
cd frontend-react
npm run dev             # Inicia Vite en puerto 5173
```

**Terminal 3 - Bot WhatsApp (opcional):**
```bash
cd backend
npm run dev             # Inicia bot en puerto 3008
```

**Acceder al dashboard:**
- Frontend: http://localhost:5173
- API: http://localhost:3009/api
- Bot: http://localhost:3008

### 🚀 Ejecución en Producción

**Backend (Railway/Render):**
```bash
cd backend
npm run build
npm start          # Inicia el bot
npm run start:api  # Inicia la API
```

**Con Docker:**
```bash
docker-compose up -d
```

## 📦 Scripts Disponibles

### Backend

```bash
npm run dev          # Desarrollo - Bot WhatsApp
npm run dev:api      # Desarrollo - API REST
npm run build        # Compilar TypeScript
npm start            # Producción - Bot
npm run start:api    # Producción - API
npm run seed:user    # Crear usuario admin
npm run seed:pedidos # Crear datos de prueba
npm run migrate      # Migrar clientes
```

## 🔐 Autenticación y Roles

### Roles Disponibles

- **Administrador**: Acceso total al sistema
- **Operador**: Gestión de clientes asignados
  - Coordinador Masivos
  - Director Comercial
  - Ejecutivo Horecas
  - Mayorista
- **Soporte**: Creación de eventos y soporte

### Flujo de Autenticación

1. **Login**: POST `/api/auth/login`
   - Devuelve `accessToken` (15 min) y `refreshToken` (7 días)
2. **Refresh**: POST `/api/auth/refresh`
   - Renueva tokens automáticamente
3. **Logout**: POST `/api/auth/logout`
   - Invalida refresh token

## 🛣️ API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Obtener usuario actual
- `POST /api/auth/forgot-password` - Recuperar contraseña
- `POST /api/auth/reset-password` - Restablecer contraseña

### Clientes
- `GET /api/clientes` - Listar clientes
- `GET /api/clientes/:telefono` - Obtener cliente

### Pedidos
- `GET /api/pedidos` - Listar pedidos
- `GET /api/pedidos/:id` - Obtener pedido

### Conversaciones
- `GET /api/conversaciones` - Listar conversaciones
- `GET /api/conversaciones/:telefono` - Detalle conversación

### Eventos
- `GET /api/eventos` - Listar eventos
- `GET /api/eventos/:id` - Detalle evento
- `POST /api/eventos` - Crear y enviar evento

### Usuarios (Solo Admin)
- `GET /api/usuarios` - Listar usuarios
- `POST /api/usuarios` - Crear usuario
- `POST /api/usuarios/bulk` - Importar usuarios CSV
- `PATCH /api/usuarios/:id/rol` - Actualizar rol
- `PATCH /api/usuarios/:id/estado` - Activar/Desactivar
- `DELETE /api/usuarios/:id` - Eliminar usuario

### Estadísticas
- `GET /api/powerbi/stats` - Estadísticas generales

## 🗂️ Modelos de Base de Datos

### Cliente
```typescript
{
  telefono: string
  nombre: string
  nombreNegocio: string
  ciudad: string
  tipoCliente: 'hogar' | 'hotel' | 'restaurante' | 'panadería' | ...
  responsable: string
  fechaRegistro: Date
}
```

### Pedido
```typescript
{
  telefono: string
  productos: Array<{nombre, cantidad}>
  fechaPedido: Date
  estado: 'pendiente' | 'procesado' | 'cancelado'
}
```

### Usuario
```typescript
{
  email: string
  passwordHash: string
  nombre: string
  rol: 'administrador' | 'operador' | 'soporte'
  tipoOperador?: string
  activo: boolean
  refreshToken?: string
}
```

## 🔧 Tecnologías Utilizadas

### Backend
- **Node.js + TypeScript**
- **Express.js** - Framework web
- **MongoDB + Mongoose** - Base de datos
- **BuilderBot** - Framework chatbot WhatsApp
- **JWT** - Autenticación
- **bcryptjs** - Hashing de contraseñas
- **SendGrid** - Envío de emails

### Frontend
- **HTML5 + CSS3 + JavaScript**
- **Fetch API** - Peticiones HTTP
- **LocalStorage** - Gestión de tokens

## 📝 Variables de Entorno

| Variable | Descripción | Requerido |
|----------|-------------|-----------|
| `MONGO_URI` | URI de MongoDB | Sí |
| `PORT` | Puerto del bot WhatsApp | No (default: 3008) |
| `API_PORT` | Puerto de la API | No (default: 3009) |
| `JWT_SECRET` | Secret para access tokens | Sí |
| `JWT_REFRESH_SECRET` | Secret para refresh tokens | Sí |
| `JWT_TOKEN` | Token WhatsApp Business API | Sí |
| `NUMBER_ID` | ID del número WhatsApp | Sí |
| `VERIFY_TOKEN` | Token de verificación | Sí |
| `SENDGRID_API_KEY` | API Key de SendGrid | No |
| `SENDGRID_FROM_EMAIL` | Email remitente | No |

## 🐳 Docker

### Construir imagen
```bash
docker build -t avellano-chatbot .
```

### Ejecutar con docker-compose
```bash
docker-compose up -d
```

### Ver logs
```bash
docker-compose logs -f backend
```

### Detener servicios
```bash
docker-compose down
```

## 📄 Licencia

Propietario - Avellano © 2024

## 👥 Soporte

Para soporte técnico, contactar al equipo de desarrollo.
