// Variables globales
let tickets = [];
let ticketsFiltrados = [];

// Elementos del DOM
const API_URL = '/api/admin/tickets';

// ===== Autenticación =====
function verificarAutenticacion() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = '../index.html';
        return false;
    }
    
    // Verificar rol
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
        const usuario = JSON.parse(usuarioStr);
        if (usuario.rol !== 'ADMIN') {
            alert('Acceso no autorizado');
            window.location.href = '../index.html';
            return false;
        }
        
        // Actualizar nombre en sidebar
        document.getElementById('ticketsUserName').textContent = usuario.nombre;
        document.getElementById('ticketsUserRole').textContent = usuario.rol;
    }
    
    return true;
}

// ===== Cargar Tickets =====
async function cargarTickets() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(API_URL, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Error al cargar tickets');
        
        tickets = await response.json();
        ticketsFiltrados = [...tickets];
        
        actualizarEstadisticas();
        mostrarTickets(ticketsFiltrados);
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los tickets');
    }
}

// ===== Mostrar Tickets en Tabla =====
function mostrarTickets(listaTickets) {
    const tbody = document.getElementById('tbodyTickets');
    const emptyState = document.getElementById('emptyState');
    
    if (listaTickets.length === 0) {
        tbody.innerHTML = '';
        emptyState.classList.remove('d-none');
        return;
    }
    
    emptyState.classList.add('d-none');
    
    tbody.innerHTML = listaTickets.map(ticket => `
        <tr>
            <td>${formatearFecha(ticket.fechaCreacion)}</td>
            <td>
                <strong>${ticket.operarioNombre}</strong>
            </td>
            <td>
                <strong>${ticket.productoCodigo}</strong><br>
                <small class="text-muted">${ticket.productoNombre}</small>
            </td>
            <td>${obtenerBadgeTipoReporte(ticket.tipoReporte)}</td>
            <td>${obtenerBadgeEstado(ticket.estado)}</td>
            <td>${ticket.respuestaAdmin ? '<span class="badge-con-respuesta"><i class="bi bi-check-circle"></i> Con respuesta</span>' : '<span class="badge-sin-respuesta"><i class="bi bi-dash-circle"></i> Sin respuesta</span>'}</td>
            <td>
                <button class="btn-view" onclick="verDetalle('${ticket.id}')">
                    <i class="bi bi-eye"></i> Ver
                </button>
                <button class="btn-manage" onclick="abrirModalGestionar('${ticket.id}')">
                    <i class="bi bi-gear"></i> Gestionar
                </button>
            </td>
        </tr>
    `).join('');
}

// ===== Formatear Fecha =====
function formatearFecha(fecha) {
    if (!fecha) return '-';
    const date = new Date(fecha);
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const año = date.getFullYear();
    const hora = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${año} ${hora}:${min}`;
}

// ===== Badges =====
function obtenerBadgeEstado(estado) {
    const badges = {
        'PENDIENTE': '<span class="badge-pendiente"><i class="bi bi-clock-history"></i> Pendiente</span>',
        'EN_REVISION': '<span class="badge-en-revision"><i class="bi bi-eye"></i> En Revisión</span>',
        'RESUELTO': '<span class="badge-resuelto"><i class="bi bi-check-circle"></i> Resuelto</span>',
        'CERRADO': '<span class="badge-cerrado"><i class="bi bi-archive"></i> Cerrado</span>'
    };
    return badges[estado] || estado;
}

function obtenerBadgeTipoReporte(tipo) {
    const badges = {
        'FALLA_AVERIA': '<span class="badge-falla"><i class="bi bi-exclamation-triangle"></i> Falla/Avería</span>',
        'REQUIERE_MANTENIMIENTO': '<span class="badge-mantenimiento"><i class="bi bi-wrench"></i> Requiere Mantenimiento</span>',
        'OBSERVACION_GENERAL': '<span class="badge-observacion"><i class="bi bi-info-circle"></i> Observación General</span>',
        'SOLICITUD_REVISION': '<span class="badge-solicitud"><i class="bi bi-clipboard-check"></i> Solicitud de Revisión</span>'
    };
    return badges[tipo] || tipo;
}

// ===== Actualizar Estadísticas =====
function actualizarEstadisticas() {
    const pendientes = tickets.filter(t => t.estado === 'PENDIENTE').length;
    const revision = tickets.filter(t => t.estado === 'EN_REVISION').length;
    const resueltos = tickets.filter(t => t.estado === 'RESUELTO').length;
    const cerrados = tickets.filter(t => t.estado === 'CERRADO').length;
    
    document.getElementById('statPendientes').textContent = pendientes;
    document.getElementById('statRevision').textContent = revision;
    document.getElementById('statResueltos').textContent = resueltos;
    document.getElementById('statCerrados').textContent = cerrados;
}

// ===== Filtros =====
function aplicarFiltros() {
    const buscar = document.getElementById('buscarTicket').value.toLowerCase();
    const estado = document.getElementById('filtroEstado').value;
    const tipoReporte = document.getElementById('filtroTipoReporte').value;
    const respuesta = document.getElementById('filtroRespuesta').value;
    
    ticketsFiltrados = tickets.filter(ticket => {
        const cumpleBusqueda = !buscar || 
            ticket.productoNombre.toLowerCase().includes(buscar) ||
            ticket.productoCodigo.toLowerCase().includes(buscar) ||
            ticket.operarioNombre.toLowerCase().includes(buscar) ||
            ticket.descripcion.toLowerCase().includes(buscar);
        
        const cumpleEstado = !estado || ticket.estado === estado;
        const cumpleTipo = !tipoReporte || ticket.tipoReporte === tipoReporte;
        
        let cumpleRespuesta = true;
        if (respuesta === 'con-respuesta') {
            cumpleRespuesta = ticket.respuestaAdmin && ticket.respuestaAdmin.trim() !== '';
        } else if (respuesta === 'sin-respuesta') {
            cumpleRespuesta = !ticket.respuestaAdmin || ticket.respuestaAdmin.trim() === '';
        }
        
        return cumpleBusqueda && cumpleEstado && cumpleTipo && cumpleRespuesta;
    });
    
    mostrarTickets(ticketsFiltrados);
}

function limpiarFiltros() {
    document.getElementById('buscarTicket').value = '';
    document.getElementById('filtroEstado').value = '';
    document.getElementById('filtroTipoReporte').value = '';
    document.getElementById('filtroRespuesta').value = '';
    aplicarFiltros();
}

// ===== Ver Detalle =====
function verDetalle(ticketId) {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    
    document.getElementById('verProducto').textContent = `${ticket.productoCodigo} - ${ticket.productoNombre}`;
    document.getElementById('verOperario').textContent = ticket.operarioNombre;
    document.getElementById('verTipoReporte').innerHTML = obtenerBadgeTipoReporte(ticket.tipoReporte);
    document.getElementById('verEstado').innerHTML = obtenerBadgeEstado(ticket.estado);
    document.getElementById('verFechaCreacion').textContent = formatearFecha(ticket.fechaCreacion);
    document.getElementById('verFechaActualizacion').textContent = formatearFecha(ticket.fechaActualizacion);
    document.getElementById('verDescripcion').textContent = ticket.descripcion;
    
    // Respuesta
    const respuestaContainer = document.getElementById('verRespuestaContainer');
    if (ticket.respuestaAdmin && ticket.respuestaAdmin.trim() !== '') {
        document.getElementById('verRespuesta').textContent = ticket.respuestaAdmin;
        document.getElementById('verFechaRespuesta').textContent = `Respondido: ${formatearFecha(ticket.fechaRespuesta)}`;
        respuestaContainer.style.display = 'block';
    } else {
        respuestaContainer.style.display = 'none';
    }
    
    const modal = new bootstrap.Modal(document.getElementById('modalVerDetalle'));
    modal.show();
}

// ===== Abrir Modal Gestionar =====
function abrirModalGestionar(ticketId) {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    
    // Cargar datos
    document.getElementById('ticketId').value = ticket.id;
    document.getElementById('infoProducto').textContent = `${ticket.productoCodigo} - ${ticket.productoNombre}`;
    document.getElementById('infoOperario').textContent = ticket.operarioNombre;
    document.getElementById('infoTipoReporte').innerHTML = obtenerBadgeTipoReporte(ticket.tipoReporte);
    document.getElementById('infoFechaCreacion').textContent = formatearFecha(ticket.fechaCreacion);
    document.getElementById('infoFechaActualizacion').textContent = formatearFecha(ticket.fechaActualizacion);
    document.getElementById('infoDescripcion').textContent = ticket.descripcion;
    
    // Estado y respuesta
    document.getElementById('ticketEstado').value = ticket.estado;
    document.getElementById('ticketRespuesta').value = ticket.respuestaAdmin || '';
    
    const modal = new bootstrap.Modal(document.getElementById('modalGestionarTicket'));
    modal.show();
}

// ===== Guardar Cambios =====
async function guardarCambios() {
    const ticketId = document.getElementById('ticketId').value;
    const nuevoEstado = document.getElementById('ticketEstado').value;
    const respuesta = document.getElementById('ticketRespuesta').value.trim();
    
    const token = localStorage.getItem('token');
    
    try {
        // Cambiar estado
        const responseEstado = await fetch(`${API_URL}/${ticketId}/estado`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ estado: nuevoEstado })
        });
        
        if (!responseEstado.ok) throw new Error('Error al cambiar estado');
        
        // Agregar respuesta si hay texto
        if (respuesta) {
            const responseRespuesta = await fetch(`${API_URL}/${ticketId}/responder`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ respuesta })
            });
            
            if (!responseRespuesta.ok) throw new Error('Error al agregar respuesta');
        }
        
        // Cerrar modal y recargar
        bootstrap.Modal.getInstance(document.getElementById('modalGestionarTicket')).hide();
        alert('Ticket actualizado correctamente');
        cargarTickets();
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar los cambios');
    }
}

// ===== Sidebar Toggle =====
function configurarSidebar() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
    });
}

// ===== Logout =====
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

// ===== Event Listeners =====
document.addEventListener('DOMContentLoaded', () => {
    if (!verificarAutenticacion()) return;
    
    configurarSidebar();
    configurarLogout();
    cargarTickets();
    
    // Filtros
    document.getElementById('buscarTicket').addEventListener('input', aplicarFiltros);
    document.getElementById('filtroEstado').addEventListener('change', aplicarFiltros);
    document.getElementById('filtroTipoReporte').addEventListener('change', aplicarFiltros);
    document.getElementById('filtroRespuesta').addEventListener('change', aplicarFiltros);
    document.getElementById('btnLimpiarFiltros').addEventListener('click', limpiarFiltros);
    
    // Guardar cambios
    document.getElementById('btnGuardarTicket').addEventListener('click', guardarCambios);
});
