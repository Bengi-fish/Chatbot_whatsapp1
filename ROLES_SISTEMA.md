# Sistema de Roles y Permisos - Avellano Chatbot

## Descripción General

El sistema implementa un control de acceso basado en roles (RBAC) con tres niveles principales: **Administrador**, **Operador** y **Soporte**. Los operadores se subdividen en 4 tipos según la zona geográfica y tipo de cliente que atienden.

## Roles Disponibles

### 1. Administrador
- **Acceso**: Completo a todas las funcionalidades
- **Permisos**:
  - Ver, crear, editar y eliminar usuarios
  - Ver todos los pedidos sin restricciones
  - Ver todas las conversaciones
  - Ver todos los clientes
  - Acceso a todas las estadísticas

### 2. Operador
Existen 4 tipos de operadores, cada uno responsable de una zona o tipo de negocio específico:

#### 2.1. Coordinador de Masivos (`coordinador_masivos`)
- **Zona**: Municipios de la región Meta
- **Responsabilidad**: Coordina pedidos de clientes en municipios como Acacías, Cumaral, Restrepo, etc.
- **Vista de pedidos**: Solo ve pedidos donde `coordinadorAsignado = "Coordinador de Masivos"`

#### 2.2. Director Comercial (`director_comercial`)
- **Zona**: Villavicencio
- **Tipo de negocios**: Tiendas, asaderos, restaurantes
- **Vista de pedidos**: Solo ve pedidos donde `coordinadorAsignado = "Director Comercial"`

#### 2.3. Ejecutivo Horecas (`ejecutivo_horecas`)
- **Tipo de negocios**: Hoteles, restaurantes premium, casinos
- **Vista de pedidos**: Solo ve pedidos donde `coordinadorAsignado = "Ejecutivo Horecas"`

#### 2.4. Coordinador Mayoristas (`mayorista`)
- **Tipo de clientes**: Mayoristas
- **Vista de pedidos**: Solo ve pedidos donde `coordinadorAsignado = "Coordinador Mayoristas"`

**Permisos comunes de Operador**:
- Ver pedidos filtrados según su tipo
- Ver conversaciones
- Ver clientes
- No puede gestionar usuarios

### 3. Soporte
- **Acceso**: Solo lectura
- **Permisos**:
  - Ver clientes (datos básicos)
  - Ver todas las conversaciones
  - Ver todos los pedidos
  - **NO** puede gestionar usuarios
  - **NO** tiene permisos de escritura (endpoints POST/PUT/DELETE bloqueados)

## Mapeo de Coordinadores

El sistema asigna automáticamente el coordinador según el municipio o tipo de negocio del cliente:

```javascript
{
  'coordinador_masivos': 'Coordinador de Masivos',
  'director_comercial': 'Director Comercial',
  'ejecutivo_horecas': 'Ejecutivo Horecas',
  'mayorista': 'Coordinador Mayoristas'
}
```

## Usuarios de Prueba Creados

| Email | Contraseña | Rol | Tipo Operador |
|-------|-----------|-----|---------------|
| admin@avellano.com | 123456 | administrador | - |
| operador1@avellano.com | 123456 | operador | coordinador_masivos |
| operador2@avellano.com | 123456 | operador | director_comercial |
| operador3@avellano.com | 123456 | operador | ejecutivo_horecas |
| operador4@avellano.com | 123456 | operador | mayorista |
| soporte@avellano.com | 123456 | soporte | - |

## Implementación Técnica

### Modelo de Usuario
```typescript
export type RolUsuario = 'administrador' | 'operador' | 'soporte'
export type TipoOperador = 'coordinador_masivos' | 'director_comercial' | 'ejecutivo_horecas' | 'mayorista' | null

interface IUsuario {
  email: string
  passwordHash: string
  rol: RolUsuario
  tipoOperador?: TipoOperador
  nombre: string
  activo: boolean
  // ... otros campos
}
```

### Middleware de Autenticación

#### `verificarToken`
Valida el JWT y adjunta información del usuario (incluyendo `tipoOperador`) a `req.user`.

#### `soloAdmin`
Permite acceso solo a usuarios con rol `administrador`.

#### `adminOOperador`
Permite acceso a usuarios con rol `administrador` u `operador`.

#### `permisoEscritura`
Bloquea operaciones de escritura (POST/PUT/DELETE) para el rol `soporte`.

#### `filtrarPedidosPorOperador`
Filtra automáticamente los pedidos según el tipo de operador:
- Si el usuario es `operador`, agrega filtro `coordinadorAsignado` según su `tipoOperador`
- Los administradores ven todos los pedidos

### Endpoints Protegidos

```typescript
// Ejemplo de endpoint con filtrado por operador
app.get('/api/pedidos', 
  verificarToken, 
  adminOOperador, 
  filtrarPedidosPorOperador, 
  async (req, res) => {
    // Los operadores solo ven sus pedidos asignados
    const filtro = req.query.coordinadorAsignado 
      ? { coordinadorAsignado: req.query.coordinadorAsignado } 
      : {}
    const pedidos = await Pedido.find(filtro)
    // ...
  }
)
```

## Crear Nuevos Usuarios

### Mediante Script
```bash
# Crear administrador
npm run seed:user -- --email=nuevo@avellano.com --password=pass123 --rol=administrador --nombre="Nuevo Admin"

# Crear operador
npm run seed:user -- --email=nuevo@avellano.com --password=pass123 --rol=operador --tipoOperador=coordinador_masivos --nombre="Nuevo Operador"

# Crear soporte
npm run seed:user -- --email=nuevo@avellano.com --password=pass123 --rol=soporte --nombre="Nuevo Soporte"
```

### Mediante API (solo Admin)
```http
POST /api/auth/register
Content-Type: application/json
Authorization: Bearer {admin_token}

{
  "email": "nuevo@avellano.com",
  "password": "pass123",
  "rol": "operador",
  "nombre": "Nuevo Operador"
}
```

**Nota**: Los tipos de operador actualmente se asignan manualmente mediante script o base de datos.

## Dashboard UI

El dashboard ajusta la visualización según el rol del usuario:

### Navegación
- **Soporte**: No ve el tab de "Usuarios"
- **Operador**: No ve el tab de "Usuarios"
- **Administrador**: Ve todos los tabs

### Badge de Rol
Muestra el rol del usuario y, si es operador, también muestra el tipo:
```
OPERADOR - COORDINADOR MASIVOS
ADMINISTRADOR
SOPORTE
```

### Colores de Badges
- **Administrador**: Rojo (`#ff6b6b`)
- **Operador**: Turquesa (`#4ecdc4`)
- **Soporte**: Verde claro (`#95e1d3`)

## Seguridad

- Las contraseñas se almacenan hasheadas con bcrypt (10 rounds)
- Los tokens JWT tienen expiración de 15 minutos (access) y 7 días (refresh)
- Los endpoints críticos requieren autenticación
- El rol y tipoOperador se validan en cada request
- Los administradores no pueden ser desactivados o eliminados desde la UI

## Archivos Modificados

- `src/models/Usuario.ts` - Modelo con nuevos roles
- `src/middleware/auth.ts` - Middleware de permisos y filtrado
- `src/server.ts` - Endpoints actualizados con nuevos middlewares
- `src/scripts/seedUser.ts` - Script actualizado para soportar tipoOperador
- `public/app.js` - UI del dashboard actualizada
- `public/styles.css` - Estilos para nuevos roles
