const API_URL = 'http://localhost:3009/api'

// Verificar autenticación al cargar la página
function checkAuthentication() {
  const token = localStorage.getItem('access_token')
  const userData = localStorage.getItem('user_data')
  
  if (!token || !userData) {
    // No hay token, redirigir al login
    window.location.href = '/login.html'
    return false
  }
  
  return true
}

// Obtener datos del usuario desde localStorage
function getUserData() {
  const data = localStorage.getItem('user_data')
  if (!data) {
    console.warn('⚠️ No hay datos de usuario en localStorage')
    return null
  }
  
  try {
    const user = JSON.parse(data)
    
    // ⭐ Validar estructura del usuario operador
    if (user.rol === 'operador' && !user.tipoOperador) {
      console.error('❌ Usuario operador sin tipoOperador:', user)
      console.log('🔄 Se requiere volver a iniciar sesión')
      // No recargar automáticamente, solo advertir
      // El middleware del servidor bloqueará las peticiones
    }
    
    return user
  } catch (e) {
    console.error('❌ Error parseando user data:', e)
    return null
  }
}

// Verificar permisos por rol
function hasRole(...roles) {
  const user = getUserData()
  return user && roles.includes(user.rol)
}

// Inicializar UI según rol del usuario
function initializeRoleBasedUI() {
  // Primero verificar autenticación
  if (!checkAuthentication()) {
    return
  }
  
  const user = getUserData()
  if (!user) {
    window.location.href = '/login.html'
    return
  }
  
  // Mostrar nombre y rol del usuario en sidebar
  const firstLetter = (user.nombre || user.email).charAt(0).toUpperCase()
  document.getElementById('user-avatar').textContent = firstLetter
  document.getElementById('user-card-name').textContent = user.nombre || 'Usuario'
  document.getElementById('user-card-email').textContent = user.email
  
  const rolBadge = document.getElementById('role-badge')
  const rolTexto = user.tipoOperador 
    ? `${user.rol.toUpperCase()} - ${user.tipoOperador.replace(/_/g, ' ').toUpperCase()}`
    : user.rol.toUpperCase()
  rolBadge.textContent = rolTexto
  rolBadge.className = `role-badge rol-${user.rol}`
  
  // Actualizar saludo
  document.getElementById('user-greeting').textContent = `Bienvenido, ${user.nombre || 'Usuario'}`
  
  // Ocultar tabs según rol
  const isSoporte = user.rol === 'soporte'
  const isOperador = user.rol === 'operador'
  const isAdmin = user.rol === 'administrador'
  
  // Soporte no ve gestión de usuarios
  if (isSoporte) {
    document.getElementById('nav-usuarios').style.display = 'none'
  }
  
  // Solo admin ve gestión de usuarios
  if (isAdmin) {
    document.getElementById('nav-usuarios').style.display = 'flex'
  }
  
  console.log(`👤 Usuario: ${user.nombre} - Rol: ${user.rol}${user.tipoOperador ? ' - Tipo: ' + user.tipoOperador : ''}`)
}

// Función para renovar el access token usando el refresh token
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refresh_token')
  if (!refreshToken) {
    console.log('❌ No hay refresh token')
    window.location.href = '/login.html'
    return null
  }
  
  try {
    console.log('🔄 Renovando access token...')
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    })
    const json = await res.json()
    
    if (json.success) {
      localStorage.setItem('access_token', json.accessToken)
      localStorage.setItem('refresh_token', json.refreshToken)
      
      // ⭐ IMPORTANTE: Actualizar también los datos del usuario
      if (json.user) {
        const currentUser = getUserData() || {}
        const updatedUser = {
          ...currentUser,
          ...json.user,
          // Asegurar que tipoOperador se preserve
          tipoOperador: json.user.tipoOperador || currentUser.tipoOperador
        }
        localStorage.setItem('user_data', JSON.stringify(updatedUser))
        console.log('✅ Token renovado y usuario actualizado:', updatedUser)
      } else {
        console.log('✅ Access token renovado')
      }
      
      return json.accessToken
    } else {
      console.log('❌ Error renovando token:', json.error)
      localStorage.clear()
      window.location.href = '/login.html'
      return null
    }
  } catch (e) {
    console.error('❌ Error en refresh:', e)
    localStorage.clear()
    window.location.href = '/login.html'
    return null
  }
}

function authHeader(){
  const t = localStorage.getItem('access_token')
  return t ? { Authorization: `Bearer ${t}` } : {}
}

// Función para hacer fetch con auto-refresh si el token expiró
async function fetchWithAuth(url, options = {}) {
  options.headers = { ...options.headers, ...authHeader() }
  
  let res = await fetch(url, options)
  
  // Si el token expiró (401), renovar y reintentar
  if (res.status === 401) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      options.headers.Authorization = `Bearer ${newToken}`
      res = await fetch(url, options)
    }
  }
  
  return res
}

async function loadStats() {
  try {
    const response = await fetchWithAuth(`${API_URL}/stats`)
    const result = await response.json();
    
    if (result.success) {
        document.getElementById('totalClientes').textContent = result.data.clientes.total;
        document.getElementById('clientesHogar').textContent = result.data.clientes.hogar;
        document.getElementById('clientesNegocio').textContent = result.data.clientes.negocio;
        document.getElementById('clientesHoy').textContent = result.data.clientes.hoy;
    }
  } catch (error) {
      console.error('Error cargando estadísticas:', error);
  }
}

// Cargar clientes (filtrados por responsable)
async function loadClientes() {
    try {
        const response = await fetchWithAuth(`${API_URL}/clientes?t=${Date.now()}`);
        const result = await response.json();
        
        console.log('📊 Clientes cargados:', result.data);
        
        const container = document.getElementById('clientes-content');
        const user = getUserData()
        
        if (result.success && result.data.length > 0) {
            const responsableMap = {
                'coordinador_masivos': 'Coord. Masivos',
                'director_comercial': 'Dir. Comercial',
                'ejecutivo_horecas': 'Ejec. Horecas',
                'mayorista': 'Mayorista'
            };
            
            container.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>Teléfono</th>
                            <th>Tipo</th>
                            <th>Nombre Negocio</th>
                            <th>Ciudad</th>
                            <th>Responsable</th>
                            <th>Fecha Registro</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${result.data.map(cliente => {
                            const responsableTexto = cliente.responsable 
                                ? responsableMap[cliente.responsable] || cliente.responsable 
                                : '-';
                            
                            return `
                                <tr class="clickable-row" onclick="verDetalleCliente('${cliente.telefono}')">
                                    <td>${cliente.telefono || '-'}</td>
                                    <td><span class="badge badge-${cliente.tipoCliente}">${cliente.tipoCliente.toUpperCase()}</span></td>
                                    <td>${cliente.nombreNegocio || '-'}</td>
                                    <td>${cliente.ciudad || '-'}</td>
                                    <td><span class="badge badge-info">${responsableTexto}</span></td>
                                    <td>${new Date(cliente.fechaRegistro).toLocaleDateString('es-CO')}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <p>No hay clientes asignados</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error cargando clientes:', error);
        document.getElementById('clientes-content').innerHTML = 
            '<div class="empty-state"><p>Error cargando datos</p></div>';
    }
}

// Cargar pedidos
async function loadPedidos() {
    const container = document.getElementById('pedidos-content');
    
    // Mostrar loading
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">⏳</div>
            <p>Cargando pedidos...</p>
        </div>
    `;
    
    try {
        console.log('📋 Iniciando carga de pedidos...')
        console.log('📋 URL:', `${API_URL}/pedidos`)
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout
        
        const response = await fetchWithAuth(`${API_URL}/pedidos?t=${Date.now()}`, {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log('📋 Respuesta recibida:', response.status)
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json();
        console.log('📋 Resultado:', result)
        
        if (result.success && result.data && result.data.length > 0) {
            container.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>ID Pedido</th>
                            <th>Cliente</th>
                            <th>Productos</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th>Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${result.data.map(pedido => {
                            const productos = Array.isArray(pedido.productos) 
                                ? pedido.productos.map(p => `${p.cantidad}x ${p.nombre}`).join(', ')
                                : pedido.productos;
                            
                            const estadoClass = {
                                'pendiente': 'badge-warning',
                                'en_proceso': 'badge-info',
                                'atendido': 'badge-success',
                                'cancelado': 'badge-danger'
                            }[pedido.estado] || 'badge-secondary';
                            
                            const estadoTexto = {
                                'pendiente': 'PENDIENTE',
                                'en_proceso': 'EN PROCESO',
                                'atendido': 'ATENDIDO',
                                'cancelado': 'CANCELADO'
                            }[pedido.estado] || pedido.estado.toUpperCase();
                            
                            return `
                                <tr class="clickable-row" onclick="verDetallePedido('${pedido._id}')">
                                    <td><strong>${pedido.idPedido || 'N/A'}</strong></td>
                                    <td>${pedido.nombreNegocio || pedido.personaContacto || '-'}</td>
                                    <td style="max-width: 350px; white-space: normal;">${productos}</td>
                                    <td><strong>$${(pedido.total || 0).toLocaleString('es-CO')}</strong></td>
                                    <td><span class="badge ${estadoClass}">${estadoTexto}</span></td>
                                    <td>${new Date(pedido.fechaPedido).toLocaleDateString('es-CO')}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;
        } else {
            console.log('ℹ️ No hay pedidos para mostrar')
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <p>No hay pedidos registrados aún</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('❌ Error cargando pedidos:', error);
        
        let errorMsg = 'Error cargando pedidos. Por favor, recarga la página.';
        if (error.name === 'AbortError') {
            errorMsg = 'Tiempo de espera agotado. Verifica tu conexión e intenta de nuevo.';
        }
        
        container.innerHTML = 
            `<div class="empty-state"><p>❌ ${errorMsg}</p></div>`;
    }
}

// Ver detalle de pedido
async function verDetallePedido(pedidoId) {
    try {
        const response = await fetchWithAuth(`${API_URL}/pedidos/${pedidoId}`);
        const result = await response.json();
        
        if (result.success) {
            const pedido = result.data;
            
            const estadoClass = {
                'pendiente': 'badge-warning',
                'en_proceso': 'badge-info',
                'atendido': 'badge-success',
                'cancelado': 'badge-danger'
            }[pedido.estado] || 'badge-secondary';
            
            const estadoTexto = {
                'pendiente': 'PENDIENTE',
                'en_proceso': 'EN PROCESO',
                'atendido': 'ATENDIDO',
                'cancelado': 'CANCELADO'
            }[pedido.estado] || pedido.estado.toUpperCase();
            
            // Determinar acciones disponibles según el estado
            let botonesAccion = '';
            if (pedido.estado === 'pendiente') {
                botonesAccion = `
                    <button class="btn-tomar-pedido" onclick="tomarPedido('${pedido._id}')">
                        📦 Tomar Pedido
                    </button>
                `;
            } else if (pedido.estado === 'en_proceso') {
                botonesAccion = `
                    <div class="botones-proceso">
                        <button class="btn-completar" onclick="completarPedido('${pedido._id}')">
                            ✅ Marcar como Atendido
                        </button>
                        <button class="btn-cancelar" onclick="cancelarPedido('${pedido._id}')">
                            ❌ Cancelar Pedido
                        </button>
                    </div>
                `;
            }
            
            const modalContent = `
                <div class="pedido-detalle">
                    <!-- Header -->
                    <div class="pedido-header">
                        <div class="pedido-header-content">
                            <h2 class="pedido-id">${pedido.idPedido}</h2>
                            <span class="badge ${estadoClass} badge-large">${estadoTexto}</span>
                        </div>
                        <div class="pedido-fecha">
                            📅 ${new Date(pedido.fechaPedido).toLocaleDateString('es-CO', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    </div>
                    
                    <!-- Información del Cliente -->
                    <div class="pedido-section">
                        <h3 class="section-title">👤 Información del Cliente</h3>
                        <div class="info-grid-pedido">
                            <div class="info-item">
                                <span class="info-label">Negocio:</span>
                                <span class="info-value">${pedido.nombreNegocio || 'No especificado'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Persona de Contacto:</span>
                                <span class="info-value">${pedido.personaContacto || 'No especificado'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Teléfono:</span>
                                <span class="info-value">${pedido.telefono}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Tipo:</span>
                                <span class="info-value">${pedido.tipoCliente.replace(/_/g, ' ').toUpperCase()}</span>
                            </div>
                            <div class="info-item full-width">
                                <span class="info-label">📍 Dirección:</span>
                                <span class="info-value">${pedido.direccion || 'No especificada'}, ${pedido.ciudad || ''}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Productos -->
                    <div class="pedido-section">
                        <h3 class="section-title">📦 Productos del Pedido</h3>
                        <table class="productos-table">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Cantidad</th>
                                    <th>Precio Unit.</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${pedido.productos.map(p => `
                                    <tr>
                                        <td><strong>${p.nombre}</strong></td>
                                        <td class="text-center">${p.cantidad}</td>
                                        <td class="text-right">$${p.precioUnitario.toLocaleString('es-CO')}</td>
                                        <td class="text-right"><strong>$${p.subtotal.toLocaleString('es-CO')}</strong></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                            <tfoot>
                                <tr class="total-row">
                                    <td colspan="3"><strong>TOTAL</strong></td>
                                    <td class="text-right"><strong class="total-price">$${pedido.total.toLocaleString('es-CO')}</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    
                    <!-- Coordinador Asignado -->
                    <div class="pedido-section">
                        <h3 class="section-title">👨‍💼 Coordinador Asignado</h3>
                        <div class="coordinador-info">
                            <div class="coordinador-nombre">${pedido.coordinadorAsignado}</div>
                            <div class="coordinador-tel">📞 ${pedido.telefonoCoordinador}</div>
                        </div>
                    </div>
                    
                    ${pedido.notas ? `
                    <div class="pedido-section">
                        <h3 class="section-title">📝 Notas</h3>
                        <div class="pedido-notas">${pedido.notas}</div>
                    </div>
                    ` : ''}
                    
                    <!-- Botones de Acción -->
                    ${botonesAccion ? `
                    <div class="pedido-acciones">
                        ${botonesAccion}
                    </div>
                    ` : ''}
                </div>
            `;
            
            document.getElementById('modalTitle').textContent = `Pedido ${pedido.idPedido}`;
            document.getElementById('modalBody').innerHTML = modalContent;
            document.getElementById('modalConversacion').classList.add('active');
        }
    } catch (error) {
        console.error('Error cargando detalle de pedido:', error);
        alert('❌ Error cargando detalle del pedido');
    }
}

// Tomar pedido (cambiar a "en_proceso")
async function tomarPedido(pedidoId) {
    if (!confirm('¿Deseas tomar este pedido? Se cambiará el estado a "En Proceso"')) {
        return;
    }
    
    try {
        const response = await fetchWithAuth(`${API_URL}/pedidos/${pedidoId}/estado`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: 'en_proceso' })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('✅ Pedido tomado exitosamente');
            cerrarModalConversacion();
            loadPedidos();
        } else {
            alert(`❌ Error: ${result.error}`);
        }
    } catch (error) {
        console.error('Error tomando pedido:', error);
        alert('❌ Error al tomar el pedido');
    }
}

// Completar pedido (cambiar a "atendido")
async function completarPedido(pedidoId) {
    if (!confirm('¿Marcar este pedido como ATENDIDO?')) {
        return;
    }
    
    try {
        const response = await fetchWithAuth(`${API_URL}/pedidos/${pedidoId}/estado`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: 'atendido' })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('✅ Pedido marcado como atendido');
            cerrarModalConversacion();
            loadPedidos();
        } else {
            alert(`❌ Error: ${result.error}`);
        }
    } catch (error) {
        console.error('Error completando pedido:', error);
        alert('❌ Error al completar el pedido');
    }
}

// Cancelar pedido
async function cancelarPedido(pedidoId) {
    const motivo = prompt('¿Por qué deseas cancelar este pedido?');
    if (!motivo) return;
    
    try {
        const response = await fetchWithAuth(`${API_URL}/pedidos/${pedidoId}/estado`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: 'cancelado', notasCancelacion: motivo })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('✅ Pedido cancelado');
            cerrarModalConversacion();
            loadPedidos();
        } else {
            alert(`❌ Error: ${result.error}`);
        }
    } catch (error) {
        console.error('Error cancelando pedido:', error);
        alert('❌ Error al cancelar el pedido');
    }
}

// Cargar conversaciones
async function loadConversaciones() {
    try {
        const response = await fetchWithAuth(`${API_URL}/conversaciones?t=${Date.now()}`);
        const result = await response.json();
        
        const container = document.getElementById('conversaciones-content');
        
        if (result.success && result.data.length > 0) {
            container.innerHTML = result.data.map(conv => {
                const nombreDisplay = conv.nombreNegocio || conv.nombreCliente || conv.telefono;
                const tipoCliente = conv.tipoCliente || 'desconocido';
                const totalMensajes = conv.mensajes?.length || 0;
                const ultimaFecha = conv.fechaUltimoMensaje ? 
                    new Date(conv.fechaUltimoMensaje).toLocaleString('es-CO') : '-';
                
                return `
                    <div class="conversacion-card" onclick="verDetalleConversacion('${conv.telefono}')">
                        <div class="conversacion-header">
                            <div>
                                <div class="conversacion-nombre">${nombreDisplay}</div>
                                <div class="conversacion-telefono">📱 ${conv.telefono}</div>
                            </div>
                            <span class="badge badge-${tipoCliente}">${tipoCliente.toUpperCase()}</span>
                        </div>
                        <div class="conversacion-stats">
                            <span>💬 ${totalMensajes} mensajes</span>
                            <span>📅 ${ultimaFecha}</span>
                            <span>🔄 ${conv.flujoActual || 'N/A'}</span>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <p>No hay conversaciones registradas aún</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error cargando conversaciones:', error);
        document.getElementById('conversaciones-content').innerHTML = 
            '<div class="empty-state"><p>Error cargando datos</p></div>';
    }
}

// Ver detalle de conversación
async function verDetalleConversacion(telefono) {
    try {
        const response = await fetchWithAuth(`${API_URL}/conversaciones/${telefono}`);
        const result = await response.json();
        
        if (result.success) {
            const conv = result.data;
            const nombreDisplay = conv.nombreNegocio || conv.nombreCliente || telefono;
            
            // Actualizar título del modal
            document.getElementById('modalTitle').textContent = 
                `Conversación con ${nombreDisplay}`;
            
            // Separar interacciones importantes
            const interaccionesImportantes = conv.interaccionesImportantes || [];
            const pedidos = interaccionesImportantes.filter(i => i.tipo === 'pedido');
            const registros = interaccionesImportantes.filter(i => i.tipo === 'registro');
            const contactos = interaccionesImportantes.filter(i => i.tipo === 'contacto_asesor');
            
            // Construir contenido del modal
            let modalContent = `
                <div style="margin-bottom: 25px;">
                    <h3 style="color: var(--avellano-red); margin-bottom: 15px;">
                        📊 Resumen de Interacciones
                    </h3>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                        <div class="stat-card">
                            <div class="stat-value">${pedidos.length}</div>
                            <div class="stat-label">Pedidos</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${registros.length}</div>
                            <div class="stat-label">Registros</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${contactos.length}</div>
                            <div class="stat-label">Contactos</div>
                        </div>
                    </div>
                </div>
            `;
            
            // Sección de interacciones importantes
            if (interaccionesImportantes.length > 0) {
                modalContent += `
                    <div class="interacciones-importantes">
                        <h4 style="margin-bottom: 10px; color: var(--avellano-red);">
                            ⭐ Interacciones Importantes
                        </h4>
                `;
                
                interaccionesImportantes.forEach(interaccion => {
                    modalContent += `
                        <div style="margin-bottom: 10px; padding: 10px; background: white; border-radius: 8px;">
                            <span class="interaccion-badge interaccion-${interaccion.tipo}">
                                ${interaccion.tipo.toUpperCase()}
                            </span>
                            <div style="margin-top: 8px; font-size: 13px;">
                                ${interaccion.contenido}
                            </div>
                            <div style="margin-top: 5px; font-size: 11px; color: #999;">
                                ${new Date(interaccion.timestamp).toLocaleString('es-CO')}
                            </div>
                        </div>
                    `;
                });
                
                modalContent += `</div>`;
            }
            
            // Timeline de mensajes
            modalContent += `
                <h4 style="margin-top: 25px; margin-bottom: 15px; color: var(--avellano-red);">
                    💬 Historial de Conversación
                </h4>
                <div class="conversacion-timeline">
            `;
            
            if (conv.mensajes && conv.mensajes.length > 0) {
                conv.mensajes.forEach(mensaje => {
                    const clase = mensaje.rol === 'usuario' ? 'mensaje-usuario' : 'mensaje-bot';
                    const icono = mensaje.rol === 'usuario' ? '👤' : '🤖';
                    
                    modalContent += `
                        <div class="timeline-item">
                            <div class="mensaje-item ${clase}">
                                <strong>${icono} ${mensaje.rol === 'usuario' ? 'Cliente' : 'Bot Avellano'}</strong>
                                <div style="margin-top: 5px;">${mensaje.mensaje}</div>
                                <div class="mensaje-timestamp">
                                    ${new Date(mensaje.timestamp).toLocaleString('es-CO')}
                                </div>
                            </div>
                        </div>
                    `;
                });
            } else {
                modalContent += '<p style="text-align: center; color: #999;">No hay mensajes registrados</p>';
            }
            
            modalContent += `</div>`;
            
            // Mostrar modal
            document.getElementById('modalBody').innerHTML = modalContent;
            document.getElementById('modalConversacion').classList.add('active');
        }
    } catch (error) {
        console.error('Error cargando detalle de conversación:', error);
        alert('❌ Error cargando detalle de conversación');
    }
}

// Ver detalle de cliente en modal
async function verDetalleCliente(telefono) {
    try {
        const response = await fetchWithAuth(`${API_URL}/clientes/${telefono}`);
        const result = await response.json();
        
        if (result.success) {
            const cliente = result.data;
            
            const responsableMap = {
                'coordinador_masivos': 'Coordinador de Masivos',
                'director_comercial': 'Director Comercial',
                'ejecutivo_horecas': 'Ejecutivo Horecas',
                'mayorista': 'Coordinador Mayoristas'
            };
            
            const modalContent = `
                <div class="cliente-detalle-modern">
                    <!-- Header mejorado -->
                    <div class="cliente-header-new">
                        <div class="header-icon-large">
                            ${cliente.tipoCliente === 'hogar' ? '🏠' : '🏢'}
                        </div>
                        <div class="header-content">
                            <h2 class="negocio-nombre">${cliente.nombreNegocio || 'Sin nombre'}</h2>
                            <div class="header-badges-new">
                                <span class="badge-pill badge-tipo">${cliente.tipoCliente.replace(/_/g, ' ')}</span>
                                <span class="badge-pill badge-resp">${responsableMap[cliente.responsable] || 'Sin asignar'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Sección de contacto destacada -->
                    <div class="section-contacto">
                        <div class="contact-item">
                            <div class="contact-icon">📱</div>
                            <div class="contact-details">
                                <span class="contact-label">Teléfono</span>
                                <span class="contact-value">${cliente.telefono}</span>
                            </div>
                        </div>
                        <div class="contact-item">
                            <div class="contact-icon">👤</div>
                            <div class="contact-details">
                                <span class="contact-label">Persona de Contacto</span>
                                <span class="contact-value">${cliente.personaContacto || 'No especificado'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Grid de información -->
                    <div class="info-grid-new">
                        <!-- Ubicación -->
                        <div class="info-section">
                            <div class="section-header">
                                <span class="section-icon">📍</span>
                                <h3 class="section-title">Ubicación</h3>
                            </div>
                            <div class="section-body">
                                <div class="info-row">
                                    <span class="info-label">Ciudad:</span>
                                    <span class="info-value">${cliente.ciudad || 'No especificada'}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Dirección:</span>
                                    <span class="info-value">${cliente.direccion || 'No especificada'}</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Fechas -->
                        <div class="info-section">
                            <div class="section-header">
                                <span class="section-icon">📅</span>
                                <h3 class="section-title">Actividad</h3>
                            </div>
                            <div class="section-body">
                                <div class="info-row">
                                    <span class="info-label">Registro:</span>
                                    <span class="info-value">${new Date(cliente.fechaRegistro).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Última interacción:</span>
                                    <span class="info-value">${new Date(cliente.ultimaInteraccion).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Productos destacados -->
                    <div class="productos-section">
                        <div class="section-header">
                            <span class="section-icon">📦</span>
                            <h3 class="section-title">Productos de Interés</h3>
                        </div>
                        <div class="productos-content">
                            <p class="productos-text">${cliente.productosInteres || 'No se han especificado productos de interés'}</p>
                        </div>
                    </div>
                    
                    <!-- Stats destacadas -->
                    <div class="stats-row">
                        <div class="stat-card">
                            <div class="stat-icon">💬</div>
                            <div class="stat-info">
                                <span class="stat-value">${cliente.conversaciones || 0}</span>
                                <span class="stat-label">Conversaciones</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">🔖</div>
                            <div class="stat-info">
                                <span class="stat-value">${cliente._id.substring(0, 8)}...</span>
                                <span class="stat-label">ID Cliente</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.getElementById('modalTitle').textContent = `${cliente.nombreNegocio || cliente.telefono}`;
            document.getElementById('modalBody').innerHTML = modalContent;
            document.getElementById('modalConversacion').classList.add('active');
        }
    } catch (error) {
        console.error('Error cargando detalle de cliente:', error);
        alert('❌ Error cargando detalle del cliente');
    }
}

// Cerrar modal de conversación
function cerrarModalConversacion() {
    document.getElementById('modalConversacion').classList.remove('active');
}

// Cerrar modal al hacer click fuera
window.onclick = function(event) {
    const modal = document.getElementById('modalConversacion');
    if (event.target === modal) {
        cerrarModalConversacion();
    }
}

// Cargar usuarios (solo admin)
async function loadUsuarios() {
    if (!hasRole('administrador')) return
    
    try {
        const response = await fetchWithAuth(`${API_URL}/usuarios?t=${Date.now()}`);
        const result = await response.json();
        
        const container = document.getElementById('usuarios-content');
        
        if (result.success && result.data.length > 0) {
            container.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Fecha Registro</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${result.data.map(user => `
                            <tr>
                                <td>${user.nombre || '-'}</td>
                                <td>${user.email}</td>
                                <td>
                                    <select class="rol-selector" onchange="changeUserRole('${user._id}', this.value)" ${user.rol === 'administrador' ? 'disabled' : ''}>
                                        <option value="soporte" ${user.rol === 'soporte' ? 'selected' : ''}>Soporte</option>
                                        <option value="operador" ${user.rol === 'operador' ? 'selected' : ''}>Operador</option>
                                        <option value="administrador" ${user.rol === 'administrador' ? 'selected' : ''}>Administrador</option>
                                    </select>
                                    ${user.tipoOperador ? `<br><small style="color: #666;">${user.tipoOperador.replace(/_/g, ' ')}</small>` : ''}
                                </td>
                                <td><span class="badge ${user.activo ? 'badge-success' : 'badge-danger'}">${user.activo ? 'Activo' : 'Inactivo'}</span></td>
                                <td>${new Date(user.createdAt).toLocaleDateString('es-CO')}</td>
                                <td>
                                    <button class="btn-small ${user.activo ? 'btn-danger' : 'btn-success'}" 
                                            onclick="toggleUserStatus('${user._id}', ${!user.activo})"
                                            ${user.rol === 'administrador' ? 'disabled' : ''}>
                                        ${user.activo ? '🚫 Desactivar' : '✅ Activar'}
                                    </button>
                                    <button class="btn-small btn-danger" 
                                            onclick="deleteUser('${user._id}', '${user.email}')"
                                            ${user.rol === 'administrador' ? 'disabled' : ''}>
                                        🗑️ Eliminar
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">👤</div>
                    <p>No hay usuarios registrados</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error cargando usuarios:', error);
        document.getElementById('usuarios-content').innerHTML = 
            '<div class="empty-state"><p>Error cargando usuarios</p></div>';
    }
}

// Cambiar rol de usuario (solo admin)
async function changeUserRole(userId, newRole) {
    if (!hasRole('administrador')) return
    
    if (!confirm(`¿Estás seguro de cambiar el rol de este usuario a ${newRole.toUpperCase()}?`)) {
        loadUsuarios() // Recargar para resetear el select
        return
    }
    
    try {
        const response = await fetchWithAuth(`${API_URL}/usuarios/${userId}/rol`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rol: newRole })
        });
        const result = await response.json();
        
        if (result.success) {
            alert(`✅ Rol actualizado exitosamente a ${newRole.toUpperCase()}`)
            loadUsuarios()
        } else {
            alert('❌ Error: ' + (result.error || 'No se pudo actualizar el rol'))
            loadUsuarios()
        }
    } catch (error) {
        console.error('Error actualizando rol:', error);
        alert('❌ Error de conexión')
        loadUsuarios()
    }
}

// Activar/Desactivar usuario (solo admin)
async function toggleUserStatus(userId, newStatus) {
    if (!hasRole('administrador')) return
    
    if (!confirm(`¿Estás seguro de ${newStatus ? 'activar' : 'desactivar'} este usuario?`)) {
        return
    }
    
    try {
        const response = await fetchWithAuth(`${API_URL}/usuarios/${userId}/estado`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ activo: newStatus })
        });
        const result = await response.json();
        
        if (result.success) {
            alert(`✅ Usuario ${newStatus ? 'activado' : 'desactivado'} exitosamente`)
            loadUsuarios()
        } else {
            alert('❌ Error: ' + (result.error || 'No se pudo actualizar el usuario'))
        }
    } catch (error) {
        console.error('Error actualizando usuario:', error);
        alert('❌ Error de conexión')
    }
}

// Eliminar usuario (solo admin)
async function deleteUser(userId, userEmail) {
    if (!hasRole('administrador')) return
    
    if (!confirm(`⚠️ ¿Estás seguro de ELIMINAR permanentemente al usuario ${userEmail}?\n\nEsta acción NO se puede deshacer.`)) {
        return
    }
    
    try {
        const response = await fetchWithAuth(`${API_URL}/usuarios/${userId}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        
        if (result.success) {
            alert('✅ Usuario eliminado exitosamente')
            loadUsuarios()
        } else {
            alert('❌ Error: ' + (result.error || 'No se pudo eliminar el usuario'))
        }
    } catch (error) {
        console.error('Error eliminando usuario:', error);
        alert('❌ Error de conexión')
    }
}

// Función de logout
async function logout() {
    try {
        await fetchWithAuth(`${API_URL}/auth/logout`, {
            method: 'POST'
        });
    } catch (e) {
        console.error('Error en logout:', e);
    }
    
    localStorage.clear();
    window.location.href = '/login.html';
}

// Cambiar entre tabs
function switchTab(tabName) {
    // Ocultar todos los tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('active');
    });

    // Mostrar tab seleccionado
    document.getElementById(`${tabName}-tab`).classList.add('active');
    document.getElementById(`page-title`).textContent = tabName.charAt(0).toUpperCase() + tabName.slice(1);
    
    // Cargar datos del tab si es usuarios
    if (tabName === 'usuarios') {
        loadUsuarios();
    }
}

// Cargar todo
function loadAll() {
    console.log('🔄 Actualizando datos...', new Date().toLocaleTimeString());
    loadStats();
    loadClientes();
    
    // Solo cargar si el usuario tiene permisos
    if (hasRole('administrador', 'operador', 'soporte')) {
        loadPedidos();
        loadConversaciones();
    }
}

// Inicializar al cargar
initializeRoleBasedUI();
loadAll();

// Auto-refresh cada 30 segundos
setInterval(loadAll, 30000);

console.log('✅ Dashboard iniciado');
