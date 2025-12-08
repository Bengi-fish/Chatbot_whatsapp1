# Resumen de Pedidos Creados - Sistema de Responsables

## Pedidos de Prueba Generados

Se han creado **10 pedidos** distribuidos entre los 4 tipos de responsables:

### 📊 Distribución por Responsable

#### 1. **Director Comercial** (4 pedidos - $878,000)
- **Tienda Don Pepe** (Villavicencio)
  - Pedido 1: $149,000 - Estado: Pendiente
  - Pedido 2: $80,000 - Estado: Pendiente
  
- **Asadero El Buen Sabor** (Villavicencio)
  - Pedido 1: $260,000 - Estado: En Proceso
  - Pedido 2: $389,000 - Estado: En Proceso

#### 2. **Coordinador de Masivos** (2 pedidos - $531,000)
- **Restaurante La Casona** (Acacías)
  - Pedido 1: $294,000 - Estado: Atendido
  - Pedido 2: $237,000 - Estado: Pendiente

#### 3. **Ejecutivo Horecas** (2 pedidos - $1,300,000)
- **Hotel & Restaurante Premium** (Villavicencio)
  - Pedido 1: $630,000 - Estado: Pendiente
  - Pedido 2: $670,000 - Estado: Atendido

#### 4. **Coordinador Mayoristas** (2 pedidos - $8,750,000)
- **Distribuidora Mega** (Villavicencio)
  - Pedido 1: $3,740,000 - Estado: En Proceso
  - Pedido 2: $5,010,000 - Estado: Atendido

---

## 📈 Estadísticas Generales

- **Total Pedidos**: 10
- **Total Ventas**: $11,459,000 COP

### Por Estado:
- ✅ **Atendidos**: 3 pedidos ($5,974,000)
- ⏳ **En Proceso**: 3 pedidos ($4,389,000)
- 📋 **Pendientes**: 4 pedidos ($1,096,000)

### Por Tipo de Cliente:
- 🏪 **Tiendas**: 2 pedidos ($229,000)
- 🍗 **Asaderos**: 2 pedidos ($649,000)
- 🍽️ **Restaurantes**: 2 pedidos ($531,000)
- ⭐ **Restaurantes Premium**: 2 pedidos ($1,300,000)
- 📦 **Mayoristas**: 2 pedidos ($8,750,000)

---

## 🧪 Pruebas del Sistema de Filtrado

### Para Operadores:
Cada operador debe iniciar sesión con su cuenta y verificar que **solo vea los pedidos asignados a su tipo**:

1. **operador1@avellano.com** (Coordinador Masivos)
   - Debe ver: 2 pedidos de "Restaurante La Casona" (Acacías)
   - Total: $531,000

2. **operador2@avellano.com** (Director Comercial)
   - Debe ver: 4 pedidos de "Tienda Don Pepe" y "Asadero El Buen Sabor"
   - Total: $878,000

3. **operador3@avellano.com** (Ejecutivo Horecas)
   - Debe ver: 2 pedidos de "Hotel & Restaurante Premium"
   - Total: $1,300,000

4. **operador4@avellano.com** (Mayorista)
   - Debe ver: 2 pedidos de "Distribuidora Mega"
   - Total: $8,750,000

### Para Administradores:
- **admin@avellano.com**
  - Debe ver: **TODOS** los 10 pedidos
  - Total: $11,459,000

### Para Soporte:
- **soporte@avellano.com**
  - Debe ver: **TODOS** los 10 pedidos (solo lectura)
  - Total: $11,459,000

---

## 🔍 Verificación en el Dashboard

### Tabla de Clientes
Debe mostrar 5 clientes con sus respectivos responsables:
- Tienda Don Pepe → **Dir. Comercial**
- Asadero El Buen Sabor → **Dir. Comercial**
- Restaurante La Casona → **Coord. Masivos**
- Hotel & Restaurante Premium → **Ejec. Horecas**
- Distribuidora Mega → **Mayorista**

### Tabla de Pedidos
Cada pedido debe mostrar el "Coordinador Asignado" correspondiente a su tipo de negocio.

---

## ✅ Funcionalidades Verificadas

1. ✅ Campo `responsable` en modelo Cliente
2. ✅ Asignación automática de responsable según ubicación y tipo de negocio
3. ✅ Creación de clientes con responsable correcto
4. ✅ Creación de pedidos con coordinador asignado
5. ✅ Filtrado de pedidos por tipo de operador
6. ✅ Visualización en dashboard con badges de responsable
7. ✅ Permisos de solo lectura para soporte
8. ✅ Acceso completo para administradores

---

## 🚀 Comandos Útiles

```bash
# Ver todos los pedidos en el dashboard
npm run dev:dashboard

# Recrear pedidos de prueba
npm run seed:pedidos:delete

# Ver logs del bot
npm run dev

# Crear nuevos usuarios operadores
npm run seed:user -- --email=nuevo@avellano.com --password=123456 --rol=operador --tipoOperador=coordinador_masivos --nombre="Nombre"
```

---

## 📝 Notas Técnicas

- Los pedidos se generan con fechas variadas (hace 15 min, 1 hora, 2 horas, 1 día, 2 días, 3 días)
- Cada pedido tiene productos y montos realistas según el tipo de cliente
- Los mayoristas tienen pedidos significativamente más grandes (bultos)
- Los restaurantes premium tienen productos con precios más altos
- El sistema mantiene la trazabilidad completa de cada pedido
