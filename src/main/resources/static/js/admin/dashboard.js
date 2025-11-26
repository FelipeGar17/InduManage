// Configuración
const API_URL = 'https://indumanage-production.up.railway.app/api';

// Estado de la aplicación
let currentSection = 'dashboard';
let usuarioActual = null;
let usuarioIdEliminar = null;

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    verificarAutenticacion();
    cargarDatosUsuario();
    cargarDashboard();
    configurarEventos();
    inicializarEventListenersUsuarios();
    
    // Detectar hash en URL y cambiar sección
    const hash = window.location.hash.substring(1); // Elimina el #
    if (hash) {
        cambiarSeccion(hash);
    }
});

// Verificar autenticación
function verificarAutenticacion() {
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    
    if (!token) {
        window.location.href = '/index.html';
        return;
    }
    
    // Verificar que sea admin
    if (usuario.rol !== 'ADMIN') {
        window.location.href = '/index.html';
        return;
    }
    
    usuarioActual = usuario;
}

// Cargar datos del usuario
function cargarDatosUsuario() {
    if (usuarioActual) {
        document.getElementById('adminUserName').textContent = usuarioActual.nombre;
        document.getElementById('adminUserRole').textContent = usuarioActual.rol;
    }
}

// Configurar eventos
function configurarEventos() {
    // Toggle sidebar
    document.getElementById('sidebarToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('active');
    });
    
    // Navegación
    document.querySelectorAll('.nav-item[data-section]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            cambiarSeccion(section);
        });
    });
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        cerrarSesion();
    });
}

// Cambiar sección
function cambiarSeccion(section) {
    // Actualizar nav items
    document.querySelectorAll('.nav-item[data-section]').forEach(item => {
        if (item.dataset.section === section) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Actualizar content sections
    document.querySelectorAll('.content-section').forEach(content => {
        content.classList.remove('active');
    });
    
    const targetSection = document.getElementById(`section-${section}`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Actualizar título
    const titles = {
        'dashboard': 'Dashboard Principal',
        'usuarios': 'Gestión de Usuarios',
        'inventario': 'Inventario de Productos',
        'agregar-producto': 'Agregar Producto',
        'tickets': 'Gestión de Tickets',
        'reportes': 'Generar Reportes'
    };
    
    document.getElementById('pageTitle').textContent = titles[section] || 'Dashboard';
    currentSection = section;
    
    // Cargar datos de la sección
    cargarDatosSeccion(section);
    
    // Cerrar sidebar en móvil
    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('active');
    }
}

// Cargar datos del dashboard
async function cargarDashboard() {
    try {
        // Aquí irían las llamadas reales a la API para estadísticas
        console.log('Dashboard cargado');
    } catch (error) {
        console.error('Error cargando dashboard:', error);
    }
}

// Cargar datos de cada sección
async function cargarDatosSeccion(section) {
    switch(section) {
        case 'usuarios':
            await cargarUsuarios();
            break;
        case 'inventario':
            await cargarInventario();
            break;
        case 'tickets':
            await cargarTickets();
            break;
        // Agregar más casos según necesites
    }
}

// Cargar lista de usuarios
async function cargarUsuarios() {
    const token = localStorage.getItem('token');
    const tbody = document.getElementById('usuariosTableBody');
    
    try {
        const response = await fetch(`${API_URL}/admin/usuarios`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar usuarios');
        }
        
        const usuarios = await response.json();
        mostrarUsuarios(usuarios);
        
    } catch (error) {
        console.error('Error:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <div class="empty-state">
                        <i class="bi bi-exclamation-circle"></i>
                        <p>Error al cargar los usuarios</p>
                        <button class="btn btn-warning btn-sm" onclick="cargarUsuarios()">
                            <i class="bi bi-arrow-clockwise me-1"></i>Reintentar
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }
}

// Mostrar usuarios en la tabla
function mostrarUsuarios(usuarios) {
    const tbody = document.getElementById('usuariosTableBody');
    
    if (usuarios.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <div class="empty-state">
                        <i class="bi bi-people"></i>
                        <p>No hay usuarios registrados</p>
                        <button class="btn btn-warning btn-sm" onclick="abrirModalNuevo()">
                            <i class="bi bi-person-plus me-1"></i>Crear Primer Usuario
                        </button>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = usuarios.map(usuario => {
        const esUsuarioActual = usuario.id === usuarioActual.id;
        const esAdmin = usuario.rol === 'ADMIN';
        
        return `
            <tr data-id="${usuario.id}" data-rol="${usuario.rol}" data-activo="${usuario.activo}">
                <td>${usuario.nombre}</td>
                <td>${usuario.correo}</td>
                <td>${usuario.telefono || '-'}</td>
                <td>
                    <span class="badge ${getBadgeRol(usuario.rol)}">
                        ${getRolTexto(usuario.rol)}
                    </span>
                </td>
                <td>
                    <span class="badge ${usuario.activo ? 'bg-success' : 'bg-danger'}">
                        ${usuario.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>${formatearFecha(usuario.fechaCreacion)}</td>
                <td class="text-center">
                    ${!esUsuarioActual && !esAdmin ? `
                        <button class="btn btn-action btn-edit" onclick="editarUsuario('${usuario.id}')" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        ${usuario.activo ? `
                            <button class="btn btn-action btn-delete" onclick="abrirModalEliminar('${usuario.id}', '${usuario.nombre}')" title="Desactivar">
                                <i class="bi bi-trash"></i>
                            </button>
                        ` : `
                            <button class="btn btn-action btn-activate" onclick="activarUsuario('${usuario.id}')" title="Activar">
                                <i class="bi bi-check-circle"></i>
                            </button>
                        `}
                    ` : `
                        <span class="text-muted"><small>${esUsuarioActual ? 'Usuario actual' : 'Administrador'}</small></span>
                    `}
                </td>
            </tr>
        `;
    }).join('');
}

// Cargar inventario
async function cargarInventario() {
    // TODO: Implementar
    console.log('Cargando inventario...');
}

// Cargar tickets
async function cargarTickets() {
    // TODO: Implementar
    console.log('Cargando tickets...');
}

// Event Listeners para gestión de usuarios
function inicializarEventListenersUsuarios() {
    // Botón nuevo usuario
    const btnNuevo = document.getElementById('btnNuevoUsuario');
    if (btnNuevo) {
        btnNuevo.addEventListener('click', abrirModalNuevo);
    }
    
    // Formulario usuario
    document.getElementById('formUsuario').addEventListener('submit', guardarUsuario);
    
    // Toggle password
    document.getElementById('togglePassword').addEventListener('click', function() {
        const passwordInput = document.getElementById('password');
        const icon = this.querySelector('i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('bi-eye');
            icon.classList.add('bi-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.remove('bi-eye-slash');
            icon.classList.add('bi-eye');
        }
    });
    
    // Filtros
    document.getElementById('searchUsuarios').addEventListener('input', filtrarUsuarios);
    document.getElementById('filterRol').addEventListener('change', filtrarUsuarios);
    document.getElementById('filterEstado').addEventListener('change', filtrarUsuarios);
    document.getElementById('btnLimpiarFiltros').addEventListener('click', limpiarFiltros);
    
    // Confirmar eliminar
    document.getElementById('btnConfirmarEliminar').addEventListener('click', confirmarEliminar);
}

// Abrir modal para nuevo usuario
function abrirModalNuevo() {
    const modal = new bootstrap.Modal(document.getElementById('modalUsuario'));
    document.getElementById('modalUsuarioTitle').innerHTML = '<i class="bi bi-person-plus me-2"></i>Nuevo Usuario';
    document.getElementById('formUsuario').reset();
    document.getElementById('usuarioId').value = '';
    document.getElementById('passwordGroup').style.display = 'block';
    document.getElementById('password').required = true;
    document.getElementById('estadoGroup').style.display = 'none';
    document.getElementById('errorAlert').classList.add('d-none');
    
    document.querySelectorAll('.form-control, .form-select').forEach(el => {
        el.classList.remove('is-invalid', 'is-valid');
    });
    
    modal.show();
}

// Editar usuario
async function editarUsuario(id) {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_URL}/admin/usuarios/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Error al cargar usuario');
        
        const usuario = await response.json();
        
        document.getElementById('usuarioId').value = usuario.id;
        document.getElementById('nombre').value = usuario.nombre;
        document.getElementById('correo').value = usuario.correo;
        document.getElementById('telefono').value = usuario.telefono || '';
        document.getElementById('direccion').value = usuario.direccion || '';
        document.getElementById('rol').value = usuario.rol;
        document.getElementById('activo').value = usuario.activo.toString();
        
        document.getElementById('passwordGroup').style.display = 'none';
        document.getElementById('password').required = false;
        document.getElementById('estadoGroup').style.display = 'block';
        document.getElementById('errorAlert').classList.add('d-none');
        
        document.getElementById('modalUsuarioTitle').innerHTML = '<i class="bi bi-pencil me-2"></i>Editar Usuario';
        
        const modal = new bootstrap.Modal(document.getElementById('modalUsuario'));
        modal.show();
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los datos del usuario');
    }
}

// Guardar usuario (crear o editar)
async function guardarUsuario(e) {
    e.preventDefault();
    
    const form = e.target;
    const errorAlert = document.getElementById('errorAlert');
    
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }
    
    const usuarioId = document.getElementById('usuarioId').value;
    const esEdicion = usuarioId !== '';
    
    const datos = {
        nombre: document.getElementById('nombre').value.trim(),
        correo: document.getElementById('correo').value.trim(),
        telefono: document.getElementById('telefono').value.trim() || null,
        direccion: document.getElementById('direccion').value.trim() || null,
        rol: document.getElementById('rol').value,
        activo: esEdicion ? document.getElementById('activo').value === 'true' : true
    };
    
    if (!esEdicion) {
        const password = document.getElementById('password').value;
        if (password.length < 6) {
            mostrarError('La contraseña debe tener al menos 6 caracteres');
            return;
        }
        datos.password = password;
    }
    
    const token = localStorage.getItem('token');
    const btnGuardar = document.getElementById('btnGuardarUsuario');
    btnGuardar.disabled = true;
    btnGuardar.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Guardando...';
    
    try {
        const url = esEdicion ? `${API_URL}/admin/usuarios/${usuarioId}` : `${API_URL}/admin/usuarios`;
        const method = esEdicion ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(datos)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al guardar usuario');
        }
        
        bootstrap.Modal.getInstance(document.getElementById('modalUsuario')).hide();
        await cargarUsuarios();
        alert(`Usuario ${esEdicion ? 'actualizado' : 'creado'} exitosamente`);
        
    } catch (error) {
        console.error('Error:', error);
        mostrarError(error.message);
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.innerHTML = '<i class="bi bi-save me-1"></i>Guardar Usuario';
    }
}

// Abrir modal eliminar
function abrirModalEliminar(id, nombre) {
    usuarioIdEliminar = id;
    document.getElementById('usuarioNombreEliminar').textContent = nombre;
    const modal = new bootstrap.Modal(document.getElementById('modalEliminar'));
    modal.show();
}

// Confirmar eliminación (desactivación)
async function confirmarEliminar() {
    const token = localStorage.getItem('token');
    const btnConfirmar = document.getElementById('btnConfirmarEliminar');
    btnConfirmar.disabled = true;
    btnConfirmar.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Desactivando...';
    
    try {
        const response = await fetch(`${API_URL}/admin/usuarios/${usuarioIdEliminar}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Error al desactivar usuario');
        
        bootstrap.Modal.getInstance(document.getElementById('modalEliminar')).hide();
        await cargarUsuarios();
        alert('Usuario desactivado exitosamente');
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al desactivar el usuario');
    } finally {
        btnConfirmar.disabled = false;
        btnConfirmar.innerHTML = '<i class="bi bi-trash me-1"></i>Desactivar';
        usuarioIdEliminar = null;
    }
}

// Activar usuario
async function activarUsuario(id) {
    if (!confirm('¿Está seguro de activar este usuario?')) return;
    
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_URL}/admin/usuarios/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ activo: true })
        });
        
        if (!response.ok) throw new Error('Error al activar usuario');
        
        await cargarUsuarios();
        alert('Usuario activado exitosamente');
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al activar el usuario');
    }
}

// Filtrar usuarios
function filtrarUsuarios() {
    const searchTerm = document.getElementById('searchUsuarios').value.toLowerCase();
    const filterRol = document.getElementById('filterRol').value;
    const filterEstado = document.getElementById('filterEstado').value;
    
    const rows = document.querySelectorAll('#usuariosTableBody tr[data-id]');
    
    rows.forEach(row => {
        const nombre = row.cells[0].textContent.toLowerCase();
        const correo = row.cells[1].textContent.toLowerCase();
        const rol = row.getAttribute('data-rol');
        const activo = row.getAttribute('data-activo');
        
        const matchSearch = nombre.includes(searchTerm) || correo.includes(searchTerm);
        const matchRol = !filterRol || rol === filterRol;
        const matchEstado = !filterEstado || activo === filterEstado;
        
        row.style.display = matchSearch && matchRol && matchEstado ? '' : 'none';
    });
}

// Limpiar filtros
function limpiarFiltros() {
    document.getElementById('searchUsuarios').value = '';
    document.getElementById('filterRol').value = '';
    document.getElementById('filterEstado').value = '';
    filtrarUsuarios();
}

// Cerrar sesión
function cerrarSesion() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.href = '/index.html';
    }
}

// Utilidades
function getBadgeRol(rol) {
    const badges = {
        'ADMIN': 'bg-danger',
        'OPERARIO': 'bg-primary',
        'CLIENTE': 'bg-info'
    };
    return badges[rol] || 'bg-secondary';
}

function getRolTexto(rol) {
    const textos = {
        'ADMIN': 'Administrador',
        'OPERARIO': 'Operario',
        'CLIENTE': 'Cliente'
    };
    return textos[rol] || rol;
}

function formatearFecha(fecha) {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

function mostrarError(mensaje) {
    const errorAlert = document.getElementById('errorAlert');
    document.getElementById('errorMessage').textContent = mensaje;
    errorAlert.classList.remove('d-none');
}
