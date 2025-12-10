# 📁 Estructura del Proyecto - Chatbot Avellano

## ✅ Estructura Limpia y Organizada

### 🔧 Backend (API + Bot)
**Ubicación:** `backend/`
- **Puerto:** 3009 (API REST)
- **Puerto Bot:** 3008 (WhatsApp)
- **Tecnologías:** Node.js, TypeScript, Express, MongoDB, BuilderBot
- **Función:** API REST pura, sin servir frontend

**Archivos importantes:**
- `backend/src/server.ts` - API REST
- `backend/src/app.ts` - Bot WhatsApp
- `backend/.env` - Configuración

### ⚛️ Frontend React (Dashboard)
**Ubicación:** `frontend-react/`
- **Puerto:** 5173 (Vite)
- **Tecnologías:** React, TypeScript, Vite
- **Función:** Dashboard de administración moderno

**Archivos importantes:**
- `frontend-react/src/pages/` - Páginas
- `frontend-react/src/services/` - Servicios API
- `frontend-react/.env` - Configuración (VITE_API_URL)

### ⚠️ Frontend Antiguo (DEPRECADO)
**Ubicación:** `frontend/`
- **Estado:** NO SE USA
- **Notas:** HTML estático antiguo, mantener solo por historial

---

## 🚀 Cómo Ejecutar el Proyecto

### 1. Backend (Terminal 1)
```bash
cd backend
npm run dev:dashboard
```
✅ API corriendo en: http://localhost:3009/api

### 2. Frontend React (Terminal 2)
```bash
cd frontend-react
npm run dev
```
✅ Dashboard en: http://localhost:5173

### 3. Bot WhatsApp (Terminal 3 - opcional)
```bash
cd backend
npm run dev
```
✅ Bot en: http://localhost:3008

---

## 📝 Cambios Realizados

### ✂️ Separación Backend/Frontend

**ANTES:**
- Backend servía frontend antiguo en puerto 3009
- Confusión entre `frontend/` y `frontend-react/`
- CORS configurado para múltiples puertos

**DESPUÉS:**
- ✅ Backend = Solo API pura (puerto 3009)
- ✅ Frontend = Solo React (puerto 5173)
- ✅ `frontend/` marcado como deprecado
- ✅ CORS limpio (solo puerto 5173)

### 📄 Archivos Modificados

1. **`backend/src/server.ts`**
   - ❌ Eliminado: `express.static()` para servir HTML
   - ❌ Eliminado: Rutas de páginas HTML
   - ✅ Agregado: Endpoint raíz con info de API

2. **`backend/.env`**
   - Cambio: `FRONTEND_URL=http://localhost:5173`
   - Cambio: `ALLOWED_ORIGINS=http://localhost:5173`

3. **`frontend-react/.env`**
   - ✅ `VITE_API_URL=http://localhost:3009/api`

4. **`README.md`**
   - ✅ Actualizado con nueva estructura
   - ✅ Instrucciones claras de ejecución

5. **`frontend/README.md`** (nuevo)
   - ⚠️ Marca carpeta como deprecada

---

## 🔐 Usuarios del Sistema

### Crear usuario operador:
```bash
cd backend
npm run seed:user -- --email=operador1@avellano.com --password=123456 --rol=operador --tipoOperador=coordinador_masivos --update=true
```

### Credenciales de prueba:
- **Email:** operador1@avellano.com
- **Password:** 123456
- **Rol:** operador
- **Tipo:** coordinador_masivos

---

## 🌐 URLs del Proyecto

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Frontend React | http://localhost:5173 | Dashboard principal |
| Backend API | http://localhost:3009/api | API REST |
| Backend Root | http://localhost:3009 | Info de la API |
| Bot WhatsApp | http://localhost:3008 | Bot conversacional |

---

## 📦 Dependencias

### Backend
- Express.js - Framework web
- Mongoose - ODM MongoDB
- BuilderBot - Framework chatbot
- JWT - Autenticación
- bcryptjs - Hash contraseñas
- SendGrid - Emails

### Frontend React
- React 18
- TypeScript
- Vite
- Axios
- React Router
- TanStack Query

---

## 🎯 Próximos Pasos

1. ✅ Backend y frontend separados correctamente
2. ✅ CORS configurado solo para React
3. ✅ Login funcional con JWT
4. ⏳ Eliminar carpeta `frontend/` cuando estés seguro
5. ⏳ Configurar variables de entorno de producción
6. ⏳ Deploy backend en Railway/Render
7. ⏳ Deploy frontend en Vercel/Netlify

---

## 📞 Soporte

Si tienes dudas sobre la estructura:
- Backend: Revisar `backend/src/server.ts`
- Frontend: Revisar `frontend-react/src/main.tsx`
- Auth: Revisar `frontend-react/src/services/auth.service.ts`
