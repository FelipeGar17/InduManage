// ===== Gestión de Órdenes - InduManage =====

const API_URL = 'http://localhost:8080/api';
let ordenes = [];
let ordenesFiltradas = [];

// ===== Inicialización =====
document.addEventListener('DOMContentLoaded', () => {
    if (!verificarAutenticacion()) return;
    
    configurarSidebar();
    configurarLogout();
    cargarOrdenes();
    cargarEstadisticas();
    
    // Event Listeners
    document.getElementById('buscarOrden').addEventListener('input', aplicarFiltros);
    document.getElementById('filtroEstado').addEventListener('change', aplicarFiltros);
    document.getElementById('filtroTipo').addEventListener('change', aplicarFiltros);
    document.getElementById('filtroFecha').addEventListener('change', aplicarFiltros);
    document.getElementById('btnLimpiarFiltros').addEventListener('click', limpiarFiltros);
    
    // Gestionar orden
    document.getElementById('btnGuardarGestion').addEventListener('click', guardarGestion);
    document.getElementById('gestionarNuevoEstado').addEventListener('change', function() {
        const motivoContainer = document.getElementById('gestionarMotivoContainer');
        if (this.value === 'RECHAZADA') {
            motivoContainer.style.display = 'block';
        } else {
            motivoContainer.style.display = 'none';
        }
    });
});

// ===== Autenticación =====
function verificarAutenticacion() {
    const token = localStorage.getItem('token');
    const usuarioStr = localStorage.getItem('usuario');
    
    if (!token) {
        window.location.href = '../index.html';
        return false;
    }
    
    if (usuarioStr) {
        const usuario = JSON.parse(usuarioStr);
        if (usuario.rol !== 'ADMIN') {
            alert('Acceso no autorizado');
            window.location.href = '../index.html';
            return false;
        }
        
        document.getElementById('ordenesUserName').textContent = usuario.nombre;
        document.getElementById('ordenesUserRole').textContent = usuario.rol;
    }
    
    return true;
}

// ===== Cargar Órdenes =====
async function cargarOrdenes() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/admin/ordenes`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Error al cargar órdenes');
        
        ordenes = await response.json();
        ordenesFiltradas = [...ordenes];
        
        mostrarOrdenes(ordenesFiltradas);
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar las órdenes');
    }
}

// ===== Cargar Estadísticas =====
async function cargarEstadisticas() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/admin/ordenes/estadisticas`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Error al cargar estadísticas');
        
        const stats = await response.json();
        
        document.getElementById('statPendientes').textContent = stats.pendientes || 0;
        document.getElementById('statRevision').textContent = stats.enRevision || 0;
        document.getElementById('statAprobadas').textContent = stats.aprobadas || 0;
        document.getElementById('statCompletadas').textContent = stats.completadas || 0;
        
    } catch (error) {
        console.error('Error:', error);
    }
}

// ===== Mostrar Órdenes en Tabla =====
function mostrarOrdenes(listaOrdenes) {
    const tbody = document.getElementById('tbodyOrdenes');
    const emptyState = document.getElementById('emptyState');
    
    if (listaOrdenes.length === 0) {
        tbody.innerHTML = '';
        emptyState.classList.remove('d-none');
        return;
    }
    
    emptyState.classList.add('d-none');
    
    tbody.innerHTML = listaOrdenes.map(orden => `
        <tr>
            <td>
                <strong>${orden.numeroOrden}</strong>
            </td>
            <td>
                <div><strong>${orden.clienteNombre}</strong></div>
                <small class="text-muted">${orden.clienteCorreo}</small>
            </td>
            <td>${obtenerBadgeTipo(orden.tipoOrden)}</td>
            <td>${obtenerBadgeEstado(orden.estado)}</td>
            <td><strong>${formatearMoneda(orden.total)}</strong></td>
            <td>${formatearFecha(orden.fechaCreacion)}</td>
            <td class="text-center">
                <button class="btn-view" onclick="verDetalle('${orden.id}')">
                    <i class="bi bi-eye"></i> Ver
                </button>
                <button class="btn-manage" onclick="abrirModalGestionar('${orden.id}')">
                    <i class="bi bi-gear"></i> Gestionar
                </button>
            </td>
        </tr>
    `).join('');
}

// ===== Ver Detalle =====
function verDetalle(ordenId) {
    const orden = ordenes.find(o => o.id === ordenId);
    if (!orden) return;
    
    document.getElementById('verNumeroOrden').textContent = orden.numeroOrden;
    document.getElementById('verTipo').innerHTML = obtenerBadgeTipo(orden.tipoOrden);
    document.getElementById('verEstado').innerHTML = obtenerBadgeEstado(orden.estado);
    document.getElementById('verFechaCreacion').textContent = formatearFecha(orden.fechaCreacion);
    
    // Cliente
    document.getElementById('verClienteNombre').textContent = orden.clienteNombre;
    document.getElementById('verClienteCorreo').textContent = orden.clienteCorreo;
    document.getElementById('verClienteTelefono').textContent = orden.clienteTelefono || '-';
    document.getElementById('verDireccion').textContent = orden.direccionEntrega || '-';
    
    // Items
    const itemsHTML = orden.items.map(item => `
        <div class="item-orden">
            <div class="row">
                <div class="col-8">
                    <div class="item-orden-nombre">${item.productoNombre}</div>
                    <div class="item-orden-detalle">
                        ${item.cantidad ? `Cantidad: ${item.cantidad} | Precio Unit: ${formatearMoneda(item.precioUnitario)}` : ''}
                        ${item.diasAlquiler ? `Días: ${item.diasAlquiler} | Precio/Día: ${formatearMoneda(item.precioDiario)}` : ''}
                    </div>
                </div>
                <div class="col-4 text-end">
                    <div class="item-orden-precio">${formatearMoneda(item.total)}</div>
                </div>
            </div>
        </div>
    `).join('');
    document.getElementById('verItems').innerHTML = itemsHTML;
    
    // Totales
    document.getElementById('verSubtotal').textContent = formatearMoneda(orden.subtotal);
    document.getElementById('verImpuestos').textContent = formatearMoneda(orden.impuestos);
    document.getElementById('verTotal').textContent = formatearMoneda(orden.total);
    
    // Observaciones
    if (orden.observacionesCliente || orden.observacionesAdmin) {
        document.getElementById('verObservaciones').textContent = 
            orden.observacionesCliente || orden.observacionesAdmin;
        document.getElementById('verObservacionesContainer').style.display = 'block';
    } else {
        document.getElementById('verObservacionesContainer').style.display = 'none';
    }
    
    const modal = new bootstrap.Modal(document.getElementById('modalVerDetalle'));
    modal.show();
}

// ===== Abrir Modal Gestionar =====
function abrirModalGestionar(ordenId) {
    const orden = ordenes.find(o => o.id === ordenId);
    if (!orden) return;
    
    document.getElementById('gestionarOrdenId').value = orden.id;
    document.getElementById('gestionarNumeroOrden').textContent = orden.numeroOrden;
    document.getElementById('gestionarCliente').textContent = orden.clienteNombre;
    document.getElementById('gestionarTotal').textContent = formatearMoneda(orden.total);
    document.getElementById('gestionarEstadoActual').innerHTML = obtenerBadgeEstado(orden.estado);
    
    // Limpiar campos
    document.getElementById('gestionarNuevoEstado').value = '';
    document.getElementById('gestionarObservaciones').value = '';
    document.getElementById('gestionarMotivo').value = '';
    document.getElementById('gestionarMotivoContainer').style.display = 'none';
    
    const modal = new bootstrap.Modal(document.getElementById('modalGestionar'));
    modal.show();
}

// ===== Guardar Gestión =====
async function guardarGestion() {
    const ordenId = document.getElementById('gestionarOrdenId').value;
    const nuevoEstado = document.getElementById('gestionarNuevoEstado').value;
    const observaciones = document.getElementById('gestionarObservaciones').value;
    const motivo = document.getElementById('gestionarMotivo').value;
    
    if (!nuevoEstado) {
        alert('Debe seleccionar un nuevo estado');
        return;
    }
    
    if (nuevoEstado === 'RECHAZADA' && !motivo) {
        alert('Debe ingresar el motivo del rechazo');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        let url = `${API_URL}/admin/ordenes/${ordenId}`;
        let body = {};
        
        if (nuevoEstado === 'APROBADA') {
            url += '/aprobar';
            body = { observacionesAdmin: observaciones };
        } else if (nuevoEstado === 'RECHAZADA') {
            url += '/rechazar';
            body = { motivoRechazo: motivo, observacionesAdmin: observaciones };
        } else {
            url += '/estado';
            body = { estado: nuevoEstado, observaciones: observaciones };
        }
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });
        
        if (!response.ok) throw new Error('Error al actualizar orden');
        
        bootstrap.Modal.getInstance(document.getElementById('modalGestionar')).hide();
        alert('Orden actualizada exitosamente');
        cargarOrdenes();
        cargarEstadisticas();
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al actualizar la orden');
    }
}

// ===== Aplicar Filtros =====
function aplicarFiltros() {
    const busqueda = document.getElementById('buscarOrden').value.toLowerCase();
    const estado = document.getElementById('filtroEstado').value;
    const tipo = document.getElementById('filtroTipo').value;
    const fecha = document.getElementById('filtroFecha').value;
    
    ordenesFiltradas = ordenes.filter(orden => {
        const cumpleBusqueda = !busqueda || 
            orden.numeroOrden.toLowerCase().includes(busqueda) ||
            orden.clienteNombre.toLowerCase().includes(busqueda) ||
            orden.clienteCorreo.toLowerCase().includes(busqueda);
        
        const cumpleEstado = !estado || orden.estado === estado;
        const cumpleTipo = !tipo || orden.tipoOrden === tipo;
        
        let cumpleFecha = true;
        if (fecha) {
            const fechaOrden = new Date(orden.fechaCreacion).toISOString().split('T')[0];
            cumpleFecha = fechaOrden === fecha;
        }
        
        return cumpleBusqueda && cumpleEstado && cumpleTipo && cumpleFecha;
    });
    
    mostrarOrdenes(ordenesFiltradas);
}

// ===== Limpiar Filtros =====
function limpiarFiltros() {
    document.getElementById('buscarOrden').value = '';
    document.getElementById('filtroEstado').value = '';
    document.getElementById('filtroTipo').value = '';
    document.getElementById('filtroFecha').value = '';
    aplicarFiltros();
}

// ===== Utilidades =====
function obtenerBadgeEstado(estado) {
    const badges = {
        'PENDIENTE': '<span class="badge-pendiente"><i class="bi bi-clock-history"></i> Pendiente</span>',
        'EN_REVISION': '<span class="badge-en-revision"><i class="bi bi-eye"></i> En Revisión</span>',
        'APROBADA': '<span class="badge-aprobada"><i class="bi bi-check-circle"></i> Aprobada</span>',
        'RECHAZADA': '<span class="badge-rechazada"><i class="bi bi-x-circle"></i> Rechazada</span>',
        'EN_PROCESO': '<span class="badge-en-proceso"><i class="bi bi-arrow-repeat"></i> En Proceso</span>',
        'COMPLETADA': '<span class="badge-completada"><i class="bi bi-check-circle-fill"></i> Completada</span>',
        'CANCELADA': '<span class="badge-cancelada"><i class="bi bi-x-circle-fill"></i> Cancelada</span>'
    };
    return badges[estado] || estado;
}

function obtenerBadgeTipo(tipo) {
    const badges = {
        'VENTA': '<span class="badge-venta">Venta</span>',
        'ALQUILER': '<span class="badge-alquiler">Alquiler</span>',
        'MIXTA': '<span class="badge-mixta">Mixta</span>'
    };
    return badges[tipo] || tipo;
}

function formatearFecha(fecha) {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-EC', {
        style: 'currency',
        currency: 'USD'
    }).format(valor);
}

// ===== Sidebar y Logout =====
function configurarSidebar() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
    });
}

function configurarLogout() {
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            window.location.href = '../index.html';
        }
    });
}