# Encargado de Hogares - Configuración Completa

## ✅ Usuario Creado

### Credenciales de Acceso
- **Email:** `encargado.hogares@avellano.com`
- **Contraseña:** `Hogares2024!`
- **Teléfono:** `3102325151`
- **Nombre:** Encargado de Ventas Hogares

### Rol y Permisos
- **Rol:** Operador
- **Tipo de Operador:** `encargado_hogares`
- **Acceso:** Solo clientes tipo "hogar"

---

## 🔧 Cambios Realizados en el Sistema

### Backend

#### 1. Modelo Usuario (`backend/src/models/Usuario.ts`)
- ✅ Agregado `'encargado_hogares'` al tipo `TipoOperador`
- ✅ Actualizado enum en el schema de MongoDB

#### 2. Modelo Cliente (`backend/src/models/Cliente.ts`)
- ✅ Agregado `'encargado_hogares'` al tipo `TipoResponsable`
- ✅ Actualizado enum en el schema de MongoDB

#### 3. Rutas de Clientes (`backend/src/routes/clientes.routes.ts`)
- ✅ Implementada lógica especial para `encargado_hogares`
- ✅ Filtro automático: Solo ve clientes con `tipoCliente: 'hogar'`

```typescript
if (req.user!.tipoOperador === 'encargado_hogares') {
  filtro = { tipoCliente: 'hogar' }
}
```

#### 4. Script de Creación (`backend/src/scripts/crearEncargadoHogares.ts`)
- ✅ Script automatizado para crear el usuario
- ✅ Comando: `npm run crear:encargado-hogares`

#### 5. Script Seed User (`backend/src/scripts/seedUser.ts`)
- ✅ Validación actualizada para incluir `encargado_hogares`

### Frontend

#### 1. Tipos (`frontend-react/src/types/index.ts`)
- ✅ Agregado `'encargado_hogares'` a `TipoOperador`
- ✅ Agregado `'encargado_hogares'` a `TipoResponsable`

#### 2. Gestión de Usuarios (`frontend-react/src/pages/dashboard/Usuarios.tsx`)
- ✅ Agregado al `roleMap` para cambio de roles
- ✅ Agregado al `tipoMap` con texto: "Encargado de Hogares"
- ✅ Opción disponible en selector de cambio de rol
- ✅ Opción disponible en formulario de crear usuario

#### 3. Detalle de Pedidos (`frontend-react/src/components/PedidoDetalle.tsx`)
- ✅ Agregado mapeo de texto: "Encargado de Hogares"

---

## 🎯 Funcionalidad

### Dashboard del Encargado de Hogares

Cuando el usuario con rol `encargado_hogares` inicia sesión en el dashboard:

1. **Clientes:**
   - ✅ Solo verá clientes con `tipoCliente: 'hogar'`
   - ❌ NO verá clientes de negocios (tiendas, asaderos, restaurantes, mayoristas)

2. **Pedidos:**
   - ✅ Verá todos los pedidos (funcionalidad estándar de operador)

3. **Conversaciones:**
   - ✅ Verá todas las conversaciones (funcionalidad estándar de operador)

4. **Eventos:**
   - ✅ Puede crear y gestionar eventos

### Diferencias con Otros Operadores

| Característica | Encargado Hogares | Otros Operadores |
|---------------|-------------------|------------------|
| **Filtro de Clientes** | `tipoCliente: 'hogar'` | `responsable: tipoOperador` |
| **Clientes Visibles** | Solo hogares | Solo negocios asignados |
| **Campo Responsable** | No aplica | Sí, por tipo de negocio |

---

## 📋 Comandos Útiles

### Backend

```bash
# Crear el usuario encargado de hogares
cd backend
npm run crear:encargado-hogares

# Crear usuario manualmente con seed
npm run seed:user -- --email=encargado.hogares@avellano.com --password=Hogares2024! --rol=operador --tipoOperador=encargado_hogares --nombre="Encargado de Ventas Hogares"
```

### Verificación

```bash
# Iniciar backend
cd backend
npm run dev

# Iniciar dashboard (en otra terminal)
cd backend
npm run dev:dashboard

# Iniciar frontend (en otra terminal)
cd frontend-react
npm run dev
```

---

## 🔐 Inicio de Sesión

1. Acceder al dashboard: http://localhost:5173
2. Ingresar credenciales:
   - Email: `encargado.hogares@avellano.com`
   - Contraseña: `Hogares2024!`
3. El usuario verá automáticamente solo los clientes hogares

---

## 📝 Notas Importantes

- ⚠️ El filtro es automático y se aplica en el backend
- ⚠️ El encargado NO puede ver clientes de negocios
- ⚠️ El campo `responsable` en la tabla Cliente NO se usa para hogares
- ✅ La lógica de filtrado está en `backend/src/routes/clientes.routes.ts`
- ✅ El usuario puede cambiar su contraseña desde el dashboard

---

## 🔄 Actualización de Datos

Si necesitas modificar el usuario:

```typescript
// Desde MongoDB o usando el dashboard de administrador
{
  email: "encargado.hogares@avellano.com",
  rol: "operador",
  tipoOperador: "encargado_hogares",
  nombre: "Encargado de Ventas Hogares",
  activo: true
}
```

---

**Fecha de Creación:** 10 de Diciembre de 2025  
**Estado:** ✅ Completamente Implementado y Funcional
