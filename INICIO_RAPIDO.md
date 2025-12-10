# 🚀 Inicio Rápido - Chatbot Avellano

## ✅ Proyecto Reorganizado

El backend ya **NO sirve** el frontend antiguo.
Ahora tienes una arquitectura limpia:
- **Backend** = API REST pura (puerto 3009)
- **Frontend** = React Dashboard (puerto 5173)

---

## 📋 Pasos para Iniciar

### Opción 1: Scripts Automáticos (Recomendado)

Abre **DOS terminales** y ejecuta:

**Terminal 1 - Backend:**
```cmd
start-backend.bat
```

**Terminal 2 - Frontend:**
```cmd
start-frontend.bat
```

### Opción 2: Manual

**Terminal 1:**
```bash
cd backend
npm run dev:dashboard
```

**Terminal 2:**
```bash
cd frontend-react
npm run dev
```

---

## 🌐 Acceder al Dashboard

1. Abre tu navegador
2. Ve a: **http://localhost:5173**
3. Inicia sesión con:
   - **Email:** operador1@avellano.com
   - **Contraseña:** 123456

---

## ❓ Solución de Problemas

### Error: "Cannot connect to API"
✅ Verifica que el backend esté corriendo en puerto 3009

### Error: "CORS blocked"
✅ Verifica que `backend/.env` tenga: `ALLOWED_ORIGINS=http://localhost:5173`

### Error: "Login failed"
✅ Crea el usuario:
```bash
cd backend
npm run seed:user -- --email=operador1@avellano.com --password=123456 --rol=operador --tipoOperador=coordinador_masivos --update=true
```

---

## 📁 Archivos Importantes

### Backend
- `backend/.env` - Configuración
- `backend/src/server.ts` - API
- `backend/src/app.ts` - Bot

### Frontend
- `frontend-react/.env` - Configuración
- `frontend-react/src/services/api.service.ts` - Cliente API
- `frontend-react/src/pages/Login.tsx` - Login

---

## 🎯 Siguiente Paso

Una vez que ambos servidores estén corriendo:
1. ✅ Backend API: http://localhost:3009/api
2. ✅ Frontend React: http://localhost:5173
3. ✅ Login con las credenciales
4. ✅ Explorar el dashboard

---

## 📝 Notas

- La carpeta `frontend/` (HTML antiguo) ya **NO se usa**
- El backend ahora es **solo API**, no sirve HTML
- Todo el frontend está en `frontend-react/`
- CORS configurado solo para puerto 5173
