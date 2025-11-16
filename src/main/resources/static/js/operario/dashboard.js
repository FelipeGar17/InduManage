// Dashboard Operario - InduManage
let productos = [];
let tickets = [];
let modalCrearTicket, modalVerTicket;
let productoSeleccionado = null;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    verificarAutenticacion();
    
    // Inicializar modales
    modalCrearTicket = new bootstrap.Modal(document.getElementById('modalCrearTicket'));
    modalVerTicket = new bootstrap.Modal(document.getElementById('modalVerTicket'));
    
    // Event Listeners
    document.getElementById('btnGuardarTicket').addEventListener('click', guardarTicket);
    document.getElementById('logoutBtn').addEventListener('click', cerrarSesion);
    
    // Navegación
    document.querySelectorAll('.nav-item[data-section]').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            cambiarSeccion(section);
        });
    });
    
    // Filtros productos
    document.getElementById('buscarProducto').addEventListener('input', filtrarProductos);
    document.getElementById('filtroTipo').addEventListener('change', filtrarProductos);
    document.getElementById('filtroCategoria').addEventListener('change', filtrarProductos);
    document.getElementById('filtroEstado').addEventListener('change', filtrarProductos);
    
    // Filtros tickets
    document.getElementById('buscarTicket').addEventListener('input', filtrarTickets);
    document.getElementById('filtroEstadoTicket').addEventListener('change', filtrarTickets);
    document.getElementById('filtroTipoReporte').addEventListener('change', filtrarTickets);
    
    // Sidebar toggle
    document.getElementById('sidebarToggle')?.addEventListener('click', toggleSidebar);
    
    // Cargar datos
    cargarProductos();
    cargarMisTickets();
});

// Verificar autenticación
function verificarAutenticacion() {
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    
    if (!token || usuario.rol !== 'OPERARIO') {
        window.location.href = '/index.html';
        return;
    }
    
    if (usuario.nombre) {
        document.getElementById('userName').textContent = usuario.nombre;
    }
}

// Toggle sidebar
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
}

// Cambiar sección
function cambiarSeccion(section) {
    // Actualizar navegación
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    
    // Mostrar sección
    document.querySelectorAll('.section-content').forEach(content => {
        content.classList.remove('active');
    });
    
    if (section === 'productos') {
        document.getElementById('seccionProductos').classList.add('active');
        document.getElementById('pageTitle').textContent = 'Productos';
    } else if (section === 'mis-tickets') {
        document.getElementById('seccionMisTickets').classList.add('active');
        document.getElementById('pageTitle').textContent = 'Mis Tickets';
        cargarMisTickets();
    }
}

// Cargar productos
async function cargarProductos() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/operario/productos', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            productos = await response.json();
            mostrarProductos(productos);
            cargarCategoriasProductos();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Mostrar productos
function mostrarProductos(listaProductos) {
    const tbody = document.getElementById('tbodyProductos');
    const emptyState = document.getElementById('emptyStateProductos');
    
    if (listaProductos.length === 0) {
        tbody.innerHTML = '';
        emptyState.classList.remove('d-none');
        return;
    }
    
    emptyState.classList.add('d-none');
    
    tbody.innerHTML = listaProductos.map(producto => {
        const tipoBadge = producto.tipo === 'MAQUINARIA' ? 'badge-maquinaria' : 'badge-repuesto';
        
        let estadoStock = '';
        if (producto.tipo === 'MAQUINARIA' && producto.estado) {
            const estadoClass = `badge-${producto.estado.toLowerCase()}`;
            estadoStock = `<span class="badge ${estadoClass}">${formatearEstado(producto.estado)}</span>`;
        } else if (producto.tipo === 'REPUESTO') {
            const stockClass = producto.stock > 0 ? 'badge-stock' : 'badge-sin-stock';
            estadoStock = `<span class="badge ${stockClass}">Stock: ${producto.stock || 0}</span>`;
        }
        
        return `
            <tr>
                <td><strong>${producto.codigo}</strong></td>
                <td>${producto.nombre}</td>
                <td><span class="badge ${tipoBadge}">${producto.tipo}</span></td>
                <td>${producto.categoria || '-'}</td>
                <td>${producto.ubicacion || '-'}</td>
                <td>${estadoStock || '-'}</td>
                <td>
                    <button class="btn btn-ticket btn-sm" onclick="abrirModalCrearTicket('${producto.id}', '${producto.codigo}', '${producto.nombre}')" title="Crear Ticket">
                        <i class="bi bi-file-earmark-plus"></i> Reportar
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Abrir modal crear ticket
function abrirModalCrearTicket(productoId, productoCodigo, productoNombre) {
    productoSeleccionado = { id: productoId, codigo: productoCodigo, nombre: productoNombre };
    
    document.getElementById('ticketProductoId').value = productoId;
    document.getElementById('ticketProductoCodigo').textContent = productoCodigo;
    document.getElementById('ticketProductoNombre').textContent = productoNombre;
    document.getElementById('formTicket').reset();
    
    modalCrearTicket.show();
}

// Guardar ticket
async function guardarTicket() {
    const form = document.getElementById('formTicket');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    
    const ticket = {
        productoId: productoSeleccionado.id,
        productoCodigo: productoSeleccionado.codigo,
        productoNombre: productoSeleccionado.nombre,
        tipoReporte: document.getElementById('ticketTipoReporte').value,
        descripcion: document.getElementById('ticketDescripcion').value,
        operarioId: usuario.id,
        operarioNombre: usuario.nombre + ' ' + (usuario.apellido || '')
    };
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/operario/tickets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(ticket)
        });
        
        if (response.ok) {
            modalCrearTicket.hide();
            alert('Ticket creado correctamente');
            cargarMisTickets();
        } else {
            const error = await response.text();
            alert('Error: ' + error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al crear el ticket');
    }
}

// Cargar mis tickets
async function cargarMisTickets() {
    try {
        const token = localStorage.getItem('token');
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        
        const response = await fetch(`/api/operario/tickets/mis-tickets?operarioId=${usuario.id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            tickets = await response.json();
            mostrarTickets(tickets);
            actualizarBadgeTickets();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Mostrar tickets
function mostrarTickets(listaTickets) {
    const tbody = document.getElementById('tbodyTickets');
    const emptyState = document.getElementById('emptyStateTickets');
    
    if (listaTickets.length === 0) {
        tbody.innerHTML = '';
        emptyState.classList.remove('d-none');
        return;
    }
    
    emptyState.classList.add('d-none');
    
    tbody.innerHTML = listaTickets.map(ticket => {
        const estadoBadge = obtenerBadgeEstadoTicket(ticket.estado);
        const tipoReporteBadge = obtenerBadgeTipoReporte(ticket.tipoReporte);
        const tieneRespuesta = ticket.respuestaAdmin ? '<i class="bi bi-check-circle-fill text-success"></i>' : '-';
        
        return `
            <tr>
                <td><strong>${ticket.productoCodigo}</strong> - ${ticket.productoNombre}</td>
                <td><span class="badge ${tipoReporteBadge}">${formatearTipoReporte(ticket.tipoReporte)}</span></td>
                <td><span class="badge ${estadoBadge}">${formatearEstadoTicket(ticket.estado)}</span></td>
                <td>${formatearFechaHora(ticket.fechaCreacion)}</td>
                <td class="text-center">${tieneRespuesta}</td>
                <td>
                    <button class="btn btn-view btn-sm" onclick="verTicket('${ticket.id}')" title="Ver detalle">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Ver ticket
async function verTicket(ticketId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/operario/tickets/${ticketId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const ticket = await response.json();
            
            document.getElementById('verProducto').textContent = `${ticket.productoCodigo} - ${ticket.productoNombre}`;
            document.getElementById('verEstado').innerHTML = `<span class="badge ${obtenerBadgeEstadoTicket(ticket.estado)}">${formatearEstadoTicket(ticket.estado)}</span>`;
            document.getElementById('verTipoReporte').textContent = formatearTipoReporte(ticket.tipoReporte);
            document.getElementById('verFechaCreacion').textContent = formatearFechaHora(ticket.fechaCreacion);
            document.getElementById('verDescripcion').textContent = ticket.descripcion;
            
            if (ticket.respuestaAdmin) {
                document.getElementById('verRespuestaContainer').style.display = 'block';
                document.getElementById('verRespuesta').textContent = ticket.respuestaAdmin;
                document.getElementById('verFechaRespuesta').textContent = `Respondido el: ${formatearFechaHora(ticket.fechaRespuesta)}`;
            } else {
                document.getElementById('verRespuestaContainer').style.display = 'none';
            }
            
            modalVerTicket.show();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Filtrar productos
function filtrarProductos() {
    const busqueda = document.getElementById('buscarProducto').value.toLowerCase();
    const filtroTipo = document.getElementById('filtroTipo').value;
    const filtroCategoria = document.getElementById('filtroCategoria').value;
    const filtroEstado = document.getElementById('filtroEstado').value;
    
    const productosFiltrados = productos.filter(producto => {
        const matchBusqueda = !busqueda || 
            producto.nombre.toLowerCase().includes(busqueda) ||
            producto.codigo.toLowerCase().includes(busqueda);
        
        const matchTipo = !filtroTipo || producto.tipo === filtroTipo;
        const matchCategoria = !filtroCategoria || producto.categoria === filtroCategoria;
        const matchEstado = !filtroEstado || producto.estado === filtroEstado;
        
        return matchBusqueda && matchTipo && matchCategoria && matchEstado;
    });
    
    mostrarProductos(productosFiltrados);
}

// Filtrar tickets
function filtrarTickets() {
    const busqueda = document.getElementById('buscarTicket').value.toLowerCase();
    const filtroEstado = document.getElementById('filtroEstadoTicket').value;
    const filtroTipo = document.getElementById('filtroTipoReporte').value;
    
    const ticketsFiltrados = tickets.filter(ticket => {
        const matchBusqueda = !busqueda || 
            ticket.productoNombre.toLowerCase().includes(busqueda) ||
            ticket.productoCodigo.toLowerCase().includes(busqueda);
        
        const matchEstado = !filtroEstado || ticket.estado === filtroEstado;
        const matchTipo = !filtroTipo || ticket.tipoReporte === filtroTipo;
        
        return matchBusqueda && matchEstado && matchTipo;
    });
    
    mostrarTickets(ticketsFiltrados);
}

// Cargar categorías
function cargarCategoriasProductos() {
    const categorias = [...new Set(productos.map(p => p.categoria).filter(c => c))];
    const select = document.getElementById('filtroCategoria');
    
    categorias.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
    });
}

// Actualizar badge de tickets
function actualizarBadgeTickets() {
    const pendientes = tickets.filter(t => t.estado === 'PENDIENTE' || t.estado === 'EN_REVISION').length;
    document.getElementById('ticketsPendientesBadge').textContent = pendientes;
    document.getElementById('notificationCount').textContent = pendientes;
}

// Utilidades de formato
function formatearEstado(estado) {
    const estados = {
        'FUNCIONANDO': 'Funcionando',
        'MANTENIMIENTO': 'Mantenimiento',
        'REVISION': 'Revisión',
        'BAJA': 'Baja'
    };
    return estados[estado] || estado;
}

function formatearEstadoTicket(estado) {
    const estados = {
        'PENDIENTE': 'Pendiente',
        'EN_REVISION': 'En Revisión',
        'RESUELTO': 'Resuelto',
        'CERRADO': 'Cerrado'
    };
    return estados[estado] || estado;
}

function formatearTipoReporte(tipo) {
    const tipos = {
        'FALLA_AVERIA': 'Falla/Avería',
        'REQUIERE_MANTENIMIENTO': 'Requiere Mantenimiento',
        'OBSERVACION_GENERAL': 'Observación General',
        'SOLICITUD_REVISION': 'Solicitud de Revisión'
    };
    return tipos[tipo] || tipo;
}

function obtenerBadgeEstadoTicket(estado) {
    const badges = {
        'PENDIENTE': 'badge-pendiente',
        'EN_REVISION': 'badge-en-revision',
        'RESUELTO': 'badge-resuelto',
        'CERRADO': 'badge-cerrado'
    };
    return badges[estado] || '';
}

function obtenerBadgeTipoReporte(tipo) {
    const badges = {
        'FALLA_AVERIA': 'badge-falla',
        'REQUIERE_MANTENIMIENTO': 'badge-mantenimiento',
        'OBSERVACION_GENERAL': 'badge-observacion',
        'SOLICITUD_REVISION': 'badge-solicitud'
    };
    return badges[tipo] || '';
}

function formatearFechaHora(fecha) {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Cerrar sesión
function cerrarSesion() {
    localStorage.clear();
    window.location.href = '/index.html';
}
