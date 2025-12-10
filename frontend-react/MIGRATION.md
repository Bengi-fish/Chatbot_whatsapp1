# Guía de Migración a React

Este documento describe la migración del frontend vanilla JavaScript al nuevo frontend React + TypeScript.

## ¿Qué se migró?

### ✅ **Completado**

1. **Arquitectura moderna**
   - React 19 con TypeScript
   - Vite como build tool
   - React Router v7 para navegación

2. **Sistema de Autenticación**
   - Context API para estado global de auth
   - Protected Routes
   - Role-based access control
   - JWT token management

3. **Servicios API**
   - Axios con interceptores
   - Servicios tipados para cada entidad
   - Manejo centralizado de errores

4. **Componentes de Layout**
   - Sidebar con navegación
   - Header con exportación de datos
   - Dashboard responsive

5. **Vistas de Datos**
   - Clientes
   - Pedidos
   - Conversaciones
   - Eventos
   - Usuarios

6. **Funcionalidades**
   - Filtrado y búsqueda
   - Exportación para Power BI
   - Sistema de roles
   - Estados de carga

## Comparación con el anterior

### Antes (Vanilla JS)
```javascript
// app.js - 3098 líneas monolíticas
function loadClientes() {
  fetch(API_URL + '/clientes')
    .then(res => res.json())
    .then(data => {
      // Manipulación DOM directa
      document.getElementById('clientes-table').innerHTML = ...
    })
}
```

### Ahora (React + TypeScript)
```typescript
// Clientes.tsx - Componente modular
const [clientes, setClientes] = useState<Cliente[]>([]);

useEffect(() => {
  loadClientes();
}, []);

const loadClientes = async () => {
  const data = await clientesService.getAll();
  setClientes(data);
};
```

## Estructura del Nuevo Proyecto

```
frontend-react/
├── public/              # Assets estáticos
│   └── assets/images/
├── src/
│   ├── components/      # Componentes reutilizables
│   │   ├── layout/
│   │   ├── ProtectedRoute.tsx
│   │   └── RoleGuard.tsx
│   ├── contexts/        # React Contexts
│   │   └── AuthContext.tsx
│   ├── pages/           # Páginas
│   │   ├── dashboard/
│   │   └── Login.tsx
│   ├── services/        # API services
│   │   ├── api.service.ts
│   │   ├── auth.service.ts
│   │   ├── clientes.service.ts
│   │   ├── pedidos.service.ts
│   │   ├── conversaciones.service.ts
│   │   ├── eventos.service.ts
│   │   ├── usuarios.service.ts
│   │   └── export.service.ts
│   ├── types/           # TypeScript types
│   │   └── index.ts
│   ├── config/          # Configuración
│   │   └── api.ts
│   ├── App.tsx
│   ├── App.css
│   └── main.tsx
├── .env                 # Variables de entorno
├── Dockerfile
├── nginx.conf
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Cómo Usar

### 1. Desarrollo Local

```bash
cd frontend-react
npm install
npm run dev
```

Abre http://localhost:5173

### 2. Build para Producción

```bash
npm run build
```

Los archivos optimizados se generan en `dist/`

### 3. Docker

```bash
docker build -t avellano-frontend-react .
docker run -p 80:80 avellano-frontend-react
```

### 4. Con Docker Compose

Actualiza `docker-compose.yml`:

```yaml
services:
  frontend:
    build: ./frontend-react
    ports:
      - "80:80"
    depends_on:
      - backend
    environment:
      - VITE_API_URL=http://localhost:3009/api
```

## Ventajas de la Nueva Arquitectura

| Aspecto | Antes | Ahora |
|---------|-------|-------|
| **Código** | 3098 líneas en 1 archivo | Modular, ~50 líneas por componente |
| **Tipado** | JavaScript dinámico | TypeScript estático |
| **Estado** | Variables globales | React hooks + Context |
| **Routing** | Tabs manuales | React Router |
| **Build** | Sin optimización | Vite (HMR, code splitting) |
| **Testing** | Difícil | Fácil (componentes aislados) |
| **Mantenimiento** | Complejo | Simple |

## Próximos Pasos Recomendados

### Funcionalidades Avanzadas
- [ ] React Query para cache de datos
- [ ] Estado global con Zustand/Redux
- [ ] Formularios con React Hook Form
- [ ] Validación con Zod
- [ ] Tests con Vitest + React Testing Library

### UI/UX Mejorado
- [ ] Biblioteca de componentes (shadcn/ui, MUI)
- [ ] Animaciones con Framer Motion
- [ ] Temas oscuro/claro
- [ ] Notificaciones toast
- [ ] Skeleton loaders

### Optimizaciones
- [ ] Lazy loading de rutas
- [ ] Virtualización de tablas grandes
- [ ] Service Worker para PWA
- [ ] Optimización de imágenes

## Migración de Datos

No se requiere migración de datos. El nuevo frontend consume la misma API REST del backend existente.

## Compatibilidad

- ✅ Compatible con backend actual
- ✅ Misma API REST
- ✅ Mismo sistema de autenticación JWT
- ✅ Mismo modelo de datos

## Notas Importantes

1. **Variables de Entorno**: Asegúrate de configurar `VITE_API_URL` en `.env`
2. **Logo**: Copia `LOGO_AVELLANO.png` a `public/assets/images/`
3. **TypeScript**: Los errores de tipo deben resolverse antes del build
4. **ESLint**: El código sigue las reglas de ESLint configuradas

## Soporte

Para preguntas o problemas:
1. Revisa la documentación de React
2. Consulta la documentación de TypeScript
3. Revisa los tipos en `src/types/index.ts`
