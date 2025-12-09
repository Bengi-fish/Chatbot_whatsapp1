# 📘 Manual de Instalación - Sistema Chatbot Avellano

## 📋 Índice

1. [Requisitos Previos](#requisitos-previos)
2. [Instalación Local](#instalación-local)
3. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
4. [Base de Datos MongoDB](#base-de-datos-mongodb)
5. [Configuración de WhatsApp Business API](#configuración-de-whatsapp-business-api)
6. [Configuración de SendGrid](#configuración-de-sendgrid)
7. [Iniciar el Sistema](#iniciar-el-sistema)
8. [Crear Usuario Administrador](#crear-usuario-administrador)
9. [Solución de Problemas](#solución-de-problemas)

---

## 🔧 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

### Software Necesario:

- [ ] **Node.js** (versión 18 o superior)
  - Descargar: https://nodejs.org/
  - Verificar: `node --version`

- [ ] **Git** (para clonar el repositorio)
  - Descargar: https://git-scm.com/
  - Verificar: `git --version`

- [ ] **Editor de Código** (recomendado: VS Code)
  - Descargar: https://code.visualstudio.com/

### Cuentas Necesarias:

- [ ] **MongoDB Atlas** (base de datos en la nube - GRATIS)
  - Crear cuenta: https://www.mongodb.com/cloud/atlas/register

- [ ] **Meta Developer** (WhatsApp Business API - GRATIS)
  - Crear cuenta: https://developers.facebook.com/

- [ ] **SendGrid** (envío de emails - GRATIS hasta 100/día)
  - Crear cuenta: https://signup.sendgrid.com/

---

## 💻 Instalación Local

### Paso 1: Clonar el Repositorio

```powershell
# Navegar a la carpeta donde quieres el proyecto
cd C:\Users\TU_USUARIO\Documentos

# Clonar el repositorio
git clone https://github.com/Nicolix16/Chatbot_whatsapp.git

# Entrar a la carpeta
cd Chatbot_whatsapp
```

### Paso 2: Instalar Dependencias

```powershell
# Instalar todas las dependencias de Node.js
npm install
```

⏱️ **Tiempo estimado:** 2-5 minutos dependiendo de tu conexión

### Paso 3: Crear Archivo de Configuración

```powershell
# Crear archivo .env desde la plantilla
Copy-Item .env.example .env

# O manualmente:
# 1. Crear archivo nuevo llamado .env
# 2. Copiar el contenido de .env.example
# 3. Pegar en .env
```

---

## ⚙️ Configuración de Variables de Entorno

Abre el archivo `.env` con tu editor de código y configura las siguientes variables:

### 1. Configuración de MongoDB

```env
# MongoDB Atlas (Cloud)
MONGO_URI=mongodb+srv://USUARIO:PASSWORD@cluster.mongodb.net/chatbot?retryWrites=true&w=majority

# O MongoDB Local (si prefieres local)
# MONGO_URI=mongodb://localhost:27017/avellano-chatbot
```

**Cómo obtener tu MONGO_URI:**
1. Ve a https://cloud.mongodb.com/
2. Crea un cluster (Free Tier - M0)
3. Clic en "Connect" → "Connect your application"
4. Copia la cadena de conexión
5. Reemplaza `<password>` con tu contraseña
6. Reemplaza `<dbname>` con `chatbot`

### 2. Configuración de WhatsApp Business API

```env
# Puerto del bot
PORT=3008

# Token de acceso de Meta
JWT_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ID del número de teléfono
NUMBER_ID=123456789012345

# Token de verificación (elige uno seguro)
VERIFY_TOKEN=mi_token_secreto_12345

# Versión de la API
PROVIDER_VERSION=v22.0
```

**Cómo obtener estos valores:**
1. Ve a https://developers.facebook.com/apps
2. Crea una app → Tipo: "Business"
3. Agrega producto: "WhatsApp"
4. En "Configuration":
   - **JWT_TOKEN**: Copia el "Temporary access token"
   - **NUMBER_ID**: Copia "Phone number ID"
   - **VERIFY_TOKEN**: Elige cualquier string seguro (ej: `avellano_webhook_2025`)

### 3. Configuración de Seguridad

```env
# Secretos JWT para el dashboard (cámbialos por valores únicos)
JWT_SECRET=tu_secreto_super_seguro_cambiar_en_produccion
JWT_REFRESH_SECRET=otro_secreto_diferente_para_refresh_tokens
```

**Genera secretos seguros:**
```powershell
# En PowerShell, genera strings aleatorios:
[System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).Guid))
```

### 4. Configuración de SendGrid

```env
# API Key de SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Email desde el que se enviarán los correos
SENDGRID_FROM_EMAIL=noreply@tudominio.com

# Nombre del remitente
SENDGRID_FROM_NAME=Avellano
```

**Cómo obtener API Key:**
1. Ve a https://app.sendgrid.com/
2. Settings → API Keys → Create API Key
3. Nombre: "Avellano Chatbot"
4. Permisos: "Full Access"
5. Copia la key (solo se muestra una vez)

**Verificar remitente:**
1. Settings → Sender Authentication
2. "Verify a Single Sender"
3. Completa el formulario con tu email
4. Verifica el email que te llegue

### Ejemplo Completo de `.env`:

```env
PORT=3008
JWT_TOKEN=EAArsstfNiqEBQMIE127G7t5e3AHZC6kZBjzFFlgYEZA8J745ZB9loaJsatPWGNw6oxOxdZCI38bCI11S7K0bpZAjMwThJICYWODVlzG7OoZCmFDZAf2kVZBTZAJcQGaojxsCrExB5jZCKxErVWwmws9AVjbtrfcoWgiKjwHvaw5f38XhMGsyS1uQBzFsmIJygmmISDIfC1Djs9njWMhR5G4B9ebgBYyEOYb6NVFUcfSMubI
NUMBER_ID=921533661023747
VERIFY_TOKEN=Niconewton123
PROVIDER_VERSION=v22.0

MONGO_URI=mongodb+srv://nicolix28:Nicolascabezas16@chatbot.0c5yk7g.mongodb.net/chatbot?retryWrites=true&w=majority&appName=chatbot

JWT_SECRET=avellano_dashboard_secret_2025_production
JWT_REFRESH_SECRET=avellano_refresh_secret_2025_production

SENDGRID_API_KEY=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
SENDGRID_FROM_EMAIL=zenservesas@gmail.com
SENDGRID_FROM_NAME=Avellano
```

---

## 🗄️ Base de Datos MongoDB

### Opción A: MongoDB Atlas (Cloud - Recomendado)

#### 1. Crear Cluster

1. Ve a https://cloud.mongodb.com/
2. Clic en "Build a Database"
3. Selecciona **FREE** (M0)
4. Elige región: **AWS / N. Virginia (us-east-1)**
5. Nombre del cluster: `Chatbot`
6. Clic en "Create"

#### 2. Configurar Acceso

**Usuario de Base de Datos:**
1. Security → Database Access
2. "Add New Database User"
3. Username: `avellano`
4. Password: (genera una segura o usa la sugerida)
5. Database User Privileges: "Read and write to any database"
6. "Add User"

**Acceso de Red:**
1. Security → Network Access
2. "Add IP Address"
3. Selecciona: **"Allow Access from Anywhere"**
4. IP Address: `0.0.0.0/0`
5. "Confirm"

#### 3. Obtener Cadena de Conexión

1. Database → Connect
2. "Connect your application"
3. Driver: Node.js
4. Version: 5.5 or later
5. Copia la cadena de conexión
6. Reemplaza `<password>` con la contraseña del usuario
7. Pégala en tu `.env` como `MONGO_URI`

### Opción B: MongoDB Local

#### Instalar MongoDB Community

1. Descargar: https://www.mongodb.com/try/download/community
2. Instalar con opciones por defecto
3. Verificar: `mongod --version`

#### Configurar en `.env`

```env
MONGO_URI=mongodb://localhost:27017/avellano-chatbot
```

---

## 📱 Configuración de WhatsApp Business API

### Paso 1: Crear App en Meta Developer

1. Ve a https://developers.facebook.com/apps/create/
2. Tipo de app: **Business**
3. Nombre: `Chatbot Avellano`
4. Email de contacto: tu email
5. Clic en "Crear app"

### Paso 2: Configurar WhatsApp

1. En el panel de tu app, clic en "Agregar producto"
2. Busca **WhatsApp** → "Configurar"
3. Acepta los términos

### Paso 3: Obtener Credenciales

**Número de Prueba (Temporal):**
1. En "API Setup" verás un número de prueba
2. Copia el **Phone number ID** → pégalo en `.env` como `NUMBER_ID`
3. Copia el **Temporary access token** → pégalo en `.env` como `JWT_TOKEN`

**Token de Verificación:**
1. Elige una frase secreta (ej: `avellano_webhook_2025`)
2. Pégala en `.env` como `VERIFY_TOKEN`

### Paso 4: Configurar Webhook (Después de iniciar el bot)

⚠️ **Hacer DESPUÉS de que el bot esté corriendo**

1. En WhatsApp → Configuration
2. Webhook → "Edit"
3. Callback URL: `https://tu-dominio.ngrok.io/webhook`
4. Verify token: El mismo que pusiste en `VERIFY_TOKEN`
5. Webhook fields: Marca **"messages"**
6. "Verify and save"

**Usar ngrok para testing local:**
```powershell
# Instalar ngrok
choco install ngrok

# O descargar de: https://ngrok.com/download

# Exponer puerto 3008
ngrok http 3008

# Copia la URL https que aparece (ej: https://abc123.ngrok.io)
```

---

## 📧 Configuración de SendGrid

### Paso 1: Crear Cuenta

1. Ve a https://signup.sendgrid.com/
2. Completa el registro
3. Verifica tu email

### Paso 2: Crear API Key

1. Settings → API Keys
2. "Create API Key"
3. Nombre: `Avellano Chatbot`
4. Tipo: **Full Access**
5. "Create & View"
6. **¡COPIA LA KEY INMEDIATAMENTE!** (solo se muestra una vez)
7. Pégala en `.env` como `SENDGRID_API_KEY`

### Paso 3: Verificar Remitente

1. Settings → Sender Authentication
2. "Verify a Single Sender"
3. Completa el formulario:
   - From Name: `Avellano`
   - From Email Address: tu email
   - Reply To: el mismo email
   - Company Address: dirección de tu negocio
4. "Create"
5. Revisa tu email y verifica
6. Una vez verificado, copia el email a `.env` como `SENDGRID_FROM_EMAIL`

---

## 🚀 Iniciar el Sistema

### Compilar el Proyecto

```powershell
# Compilar TypeScript a JavaScript
npm run build
```

### Iniciar el Bot de WhatsApp

```powershell
# Iniciar bot (puerto 3008)
npm start
```

**Deberías ver:**
```
✅ Bot conectado a MongoDB
🤖 Bot de WhatsApp iniciado
📱 Webhook URL: http://localhost:3008/webhook
```

### Iniciar el Dashboard (En otra terminal)

```powershell
# Abrir nueva ventana de PowerShell
# Navegar a la carpeta del proyecto
cd C:\Users\TU_USUARIO\Documentos\Chatbot_whatsapp

# Iniciar dashboard (puerto 3009)
npm run dev:dashboard
```

**Deberías ver:**
```
🌐 Dashboard disponible en: http://localhost:3009
📡 API disponible en: http://localhost:3009/api
✅ API conectada a MongoDB
📧 SendGrid configurado correctamente
```

### Acceder al Dashboard

1. Abre tu navegador
2. Ve a: `http://localhost:3009/login.html`
3. Inicia sesión (primero crea un usuario - ver siguiente sección)

---

## 👤 Crear Usuario Administrador

### Método 1: Script Automático (Recomendado)

```powershell
# Crear usuario administrador con script
npm run seed:user
```

**Credenciales por defecto:**
- Email: `admin@avellano.com`
- Password: `admin123`
- Rol: Administrador

### Método 2: Manual

```powershell
# Abrir terminal Node.js
node

# Ejecutar en la consola de Node:
```
```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('TU_MONGO_URI_AQUI');

const Usuario = mongoose.model('Usuario', new mongoose.Schema({
  email: String,
  passwordHash: String,
  rol: String,
  activo: Boolean,
  nombre: String
}));

async function crearAdmin() {
  const passwordHash = await bcrypt.hash('admin123', 10);
  await Usuario.create({
    email: 'admin@avellano.com',
    passwordHash,
    rol: 'administrador',
    activo: true,
    nombre: 'Administrador'
  });
  console.log('✅ Usuario admin creado');
  process.exit();
}

crearAdmin();
```

### Cambiar Contraseña del Admin

1. Inicia sesión con el admin
2. Ve a la sección "Usuarios"
3. Busca tu usuario
4. Haz clic en "Editar"
5. Cambia la contraseña

---

## 🧪 Verificar Instalación

### Checklist de Verificación:

- [ ] Bot de WhatsApp corriendo en puerto 3008
- [ ] Dashboard corriendo en puerto 3009
- [ ] Login funciona en `http://localhost:3009/login.html`
- [ ] Se pueden ver clientes en el dashboard
- [ ] MongoDB Atlas acepta conexiones
- [ ] SendGrid envía emails de prueba

### Probar Funcionalidades:

**1. Probar WhatsApp Bot:**
```
Envía mensaje desde un número de prueba registrado en Meta Developer:
"Hola"
```

**2. Probar Dashboard:**
- Login exitoso
- Ver lista de clientes
- Ver lista de pedidos
- Crear evento (solo admin)

**3. Probar Recuperación de Contraseña:**
- Clic en "¿Olvidó su contraseña?"
- Ingresa email del admin
- Revisa que llegue email de SendGrid

---

## 🐛 Solución de Problemas

### Error: "Cannot connect to MongoDB"

**Solución:**
```powershell
# Verificar que MongoDB Atlas permita tu IP
# 1. Ve a MongoDB Atlas
# 2. Network Access → Add IP → Allow Access from Anywhere
```

### Error: "Module not found"

**Solución:**
```powershell
# Reinstalar dependencias
Remove-Item -Recurse -Force node_modules
npm install
npm run build
```

### Error: "Port 3008 already in use"

**Solución:**
```powershell
# Ver qué proceso usa el puerto
netstat -ano | findstr :3008

# Matar el proceso (reemplaza PID con el número que aparece)
taskkill /PID NUMERO_PID /F

# O cambiar puerto en .env
# PORT=3010
```

### Error: "SendGrid 401 Unauthorized"

**Solución:**
1. Verifica que la API Key sea correcta
2. Verifica que el email esté verificado en SendGrid
3. Regenera la API Key si es necesario

### Bot no recibe mensajes

**Solución:**
1. Verifica que ngrok esté corriendo
2. Verifica que la Callback URL en Meta Developer sea correcta
3. Verifica que el VERIFY_TOKEN coincida
4. Revisa logs del bot para ver errores

### Dashboard no carga datos

**Solución:**
```powershell
# Verificar que MongoDB tenga datos
# Ejecutar script de prueba:
npm run seed:pedidos
```

---

## 📊 Datos de Prueba

### Crear Pedidos de Prueba

```powershell
# Generar 10 pedidos de prueba
npm run seed:pedidos

# Eliminar pedidos de prueba
npm run seed:pedidos:delete
```

### Migrar Clientes (si vienes de otra versión)

```powershell
npm run migrate:clientes
```

---

## 🔄 Actualizar el Sistema

```powershell
# Detener bot y dashboard (Ctrl+C en cada terminal)

# Actualizar código desde GitHub
git pull origin main

# Reinstalar dependencias
npm install

# Recompilar
npm run build

# Reiniciar bot
npm start

# Reiniciar dashboard (en otra terminal)
npm run dev:dashboard
```

---

## 📚 Comandos Útiles

```powershell
# Desarrollo
npm run dev              # Bot en modo desarrollo
npm run dev:dashboard    # Dashboard en modo desarrollo

# Producción
npm start                # Bot en producción
npm run start:dashboard  # Dashboard en producción

# Build
npm run build            # Compilar bot
npm run build:server     # Compilar dashboard

# Scripts
npm run seed:user        # Crear usuario admin
npm run seed:pedidos     # Generar pedidos de prueba
npm run migrate:clientes # Migrar clientes
```

---

## 📂 Estructura del Proyecto

```
Chatbot_whatsapp/
├── src/
│   ├── app.ts              # Bot de WhatsApp
│   ├── server.ts           # Dashboard/API
│   ├── flows/              # Flujos del chatbot
│   ├── models/             # Modelos de MongoDB
│   ├── middleware/         # Middlewares (auth, etc)
│   └── scripts/            # Scripts de utilidad
├── public/                 # Archivos del dashboard
│   ├── index.html          # Dashboard principal
│   ├── login.html          # Página de login
│   ├── app.js              # JavaScript del dashboard
│   └── styles-sidebar.css  # Estilos
├── dist/                   # Archivos compilados
├── .env                    # Variables de entorno
├── package.json            # Dependencias
└── tsconfig.json           # Configuración TypeScript
```

---

## 🆘 Soporte

### Documentación Adicional:

- **WhatsApp Business API:** https://developers.facebook.com/docs/whatsapp
- **MongoDB Atlas:** https://www.mongodb.com/docs/atlas/
- **SendGrid:** https://docs.sendgrid.com/
- **Node.js:** https://nodejs.org/docs/

### Logs del Sistema:

```powershell
# Ver logs del bot en tiempo real
npm start

# Ver logs del dashboard
npm run dev:dashboard
```

---

## ✅ Checklist Post-Instalación

Antes de poner en producción, verifica:

- [ ] MongoDB Atlas configurado correctamente
- [ ] Network Access permite todas las IPs (0.0.0.0/0)
- [ ] SendGrid verificado y funcionando
- [ ] WhatsApp Webhook configurado
- [ ] Usuario administrador creado
- [ ] Contraseña del admin cambiada
- [ ] Variables JWT_SECRET generadas (no usar las de ejemplo)
- [ ] Backup de la base de datos configurado
- [ ] SSL/HTTPS configurado (para producción)
- [ ] Dominio personalizado (para producción)

---

## 🎉 ¡Instalación Completada!

Tu sistema Chatbot Avellano está listo para usar:

- **Bot WhatsApp:** http://localhost:3008
- **Dashboard:** http://localhost:3009/login.html

**Próximos pasos:**
1. Revisar `DESPLIEGUE_VERCEL.md` para desplegar en producción
2. Configurar webhook con dominio público
3. Personalizar flujos del chatbot según necesidades
4. Agregar más usuarios operadores

---

**Versión del Manual:** 1.0  
**Última Actualización:** Diciembre 2025  
**Autor:** Nicolix16
