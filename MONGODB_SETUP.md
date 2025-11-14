# MongoDB - Guía de Uso para Avellano Chatbot

## ✅ Configuración Completa

Ya tienes MongoDB integrado en tu proyecto. Los siguientes archivos fueron creados/modificados:

### Archivos Modificados:
- `src/app.ts` - Ahora usa MongoAdapter en lugar de MemoryDB
- `.env` - Agregada configuración MONGO_URI

### Archivos Creados:
- `src/models/Cliente.ts` - Modelo para guardar información de clientes
- `src/models/Pedido.ts` - Modelo para guardar pedidos
- `src/models/Conversacion.ts` - Modelo para guardar historial de conversaciones

## 🚀 Cómo Iniciar MongoDB

### Opción 1: MongoDB Local (Recomendado para desarrollo)

1. **Descargar MongoDB Community:**
   - Ve a: https://www.mongodb.com/try/download/community
   - Descarga e instala MongoDB Community Edition
   - Durante la instalación, marca "Install MongoDB as a Service"

2. **Verificar que MongoDB esté corriendo:**
   ```cmd
   mongosh
   ```
   Si se conecta, MongoDB está funcionando ✅

3. **Iniciar tu bot:**
   ```cmd
   npm run dev
   ```

### Opción 2: MongoDB Atlas (Cloud - GRATIS)

1. **Crear cuenta gratuita:**
   - Ve a: https://www.mongodb.com/cloud/atlas/register
   - Crea una cuenta gratis (tier M0 - gratis para siempre)

2. **Crear un cluster:**
   - Sigue el wizard para crear tu primer cluster
   - Espera 3-5 minutos a que se cree

3. **Obtener tu string de conexión:**
   - Click en "Connect" en tu cluster
   - Selecciona "Connect your application"
   - Copia el string de conexión
   - Ejemplo: `mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/`

4. **Actualizar .env:**
   ```env
   MONGO_URI=mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/avellano-chatbot
   ```

5. **Iniciar tu bot:**
   ```cmd
   npm run dev
   ```

## 📊 Modelos de Base de Datos

### Cliente
Guarda información de cada cliente:
```typescript
{
  telefono: string          // Número de WhatsApp
  nombre?: string          // Nombre del cliente (opcional)
  tipoCliente: 'hogar' | 'negocio'
  nombreNegocio?: string   // Solo para negocios
  ciudad?: string          // Solo para negocios
  personaContacto?: string // Solo para negocios
  productosInteres?: string
  fechaRegistro: Date
  ultimaInteraccion: Date
  conversaciones: number
}
```

### Pedido
Guarda cada pedido realizado:
```typescript
{
  telefono: string
  tipoCliente: 'hogar' | 'negocio'
  productos: string
  estado: 'pendiente' | 'procesando' | 'completado' | 'cancelado'
  fechaPedido: Date
  notas?: string
}
```

### Conversacion
Guarda el historial de conversaciones:
```typescript
{
  telefono: string
  mensajes: [
    {
      rol: 'usuario' | 'bot'
      mensaje: string
      timestamp: Date
    }
  ]
  flujoActual: string
  fechaInicio: Date
  fechaUltimoMensaje: Date
}
```

## 🔧 Cómo Usar los Modelos en tu Código

### Ejemplo: Guardar un cliente nuevo

```typescript
import Cliente from './models/Cliente'

// Dentro de tu flujo
const nuevoCliente = new Cliente({
  telefono: ctx.from,
  tipoCliente: 'hogar',
  fechaRegistro: new Date(),
})

await nuevoCliente.save()
```

### Ejemplo: Buscar un cliente

```typescript
import Cliente from './models/Cliente'

const cliente = await Cliente.findOne({ telefono: ctx.from })

if (cliente) {
  // Cliente ya existe
  console.log(`Bienvenido de nuevo ${cliente.nombre}`)
} else {
  // Cliente nuevo
  console.log('Primer contacto')
}
```

### Ejemplo: Guardar un pedido

```typescript
import Pedido from './models/Pedido'

const nuevoPedido = new Pedido({
  telefono: ctx.from,
  tipoCliente: 'hogar',
  productos: ctx.body, // El texto que escribió el usuario
  estado: 'pendiente',
})

await nuevoPedido.save()
```

## 📈 Ver tus Datos

### Opción 1: MongoDB Compass (GUI Local)
1. Descarga: https://www.mongodb.com/try/download/compass
2. Conecta a: `mongodb://localhost:27017`
3. Explora tu base de datos `avellano-chatbot`

### Opción 2: MongoDB Atlas (Cloud)
1. Ve a tu dashboard en MongoDB Atlas
2. Click en "Browse Collections"
3. Verás todas tus colecciones: clientes, pedidos, conversaciones

## ✨ Próximos Pasos

Ahora puedes:
1. Modificar los flujos para guardar información de clientes
2. Crear reportes de pedidos
3. Hacer seguimiento de conversaciones
4. Crear estadísticas de uso

## ⚠️ Importante

- MongoDB debe estar corriendo ANTES de iniciar tu bot
- Si usas MongoDB local, inicia el servicio de MongoDB
- Si usas MongoDB Atlas, asegúrate de tener conexión a internet
- La primera vez que se conecte, MongoDB creará automáticamente la base de datos y colecciones

## 🆘 Solución de Problemas

### Error: "MongooseServerSelectionError"
- MongoDB no está corriendo o la URI es incorrecta
- Verifica que MongoDB esté activo
- Verifica tu MONGO_URI en .env

### Error: "Authentication failed"
- Tu usuario/password en la URI es incorrecto
- Verifica las credenciales en MongoDB Atlas

### Error: "Connection timeout"
- Firewall bloqueando la conexión
- En Atlas, agrega tu IP a la whitelist
