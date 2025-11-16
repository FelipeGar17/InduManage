// Gestión de Productos - InduManage
let productos = [];
let productoEditando = null;
let modalProducto, modalEliminar;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    verificarAutenticacion();
    
    // Inicializar modales
    modalProducto = new bootstrap.Modal(document.getElementById('modalProducto'));
    modalEliminar = new bootstrap.Modal(document.getElementById('modalEliminar'));
    
    // Event Listeners
    document.getElementById('btnNuevoProducto').addEventListener('click', abrirModalNuevo);
    document.getElementById('btnGuardarProducto').addEventListener('click', guardarProducto);
    document.getElementById('btnConfirmarEliminar').addEventListener('click', confirmarEliminar);
    document.getElementById('logoutBtn').addEventListener('click', cerrarSesion);
    
    // Filtros
    document.getElementById('buscarProducto').addEventListener('input', filtrarProductos);
    document.getElementById('filtroTipo').addEventListener('change', filtrarProductos);
    document.getElementById('filtroCategoria').addEventListener('change', filtrarProductos);
    document.getElementById('filtroEstado').addEventListener('change', filtrarProductos);
    document.getElementById('filtroActivo').addEventListener('change', filtrarProductos);
    
    // Campos condicionales según tipo
    document.getElementById('productoTipo').addEventListener('change', toggleCamposCondicionales);
    
    // Autocompletado
    document.getElementById('productoNombre').addEventListener('input', autocompletarNombres);
    
    // Cargar datos iniciales
    cargarProductos();
    cargarCategorias();
    cargarUbicaciones();
    
    // Sidebar toggle
    document.getElementById('sidebarToggle')?.addEventListener('click', toggleSidebar);
});

// Verificar autenticación
function verificarAutenticacion() {
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    
    if (!token || usuario.rol !== 'ADMIN') {
        window.location.href = '/index.html';
        return;
    }
    
    // Mostrar nombre de usuario
    if (usuario.nombre) {
        document.getElementById('productosUserName').textContent = usuario.nombre;
        document.getElementById('productosUserRole').textContent = usuario.rol;
    }
}

// Toggle sidebar
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
}

// Cargar productos
async function cargarProductos() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/productos', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            productos = await response.json();
            mostrarProductos(productos);
        } else {
            console.error('Error al cargar productos');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Mostrar productos en tabla
function mostrarProductos(listaProductos) {
    const tbody = document.getElementById('tbodyProductos');
    const emptyState = document.getElementById('emptyState');
    
    if (listaProductos.length === 0) {
        tbody.innerHTML = '';
        emptyState.classList.remove('d-none');
        return;
    }
    
    emptyState.classList.add('d-none');
    
    tbody.innerHTML = listaProductos.map(producto => {
        const inactivo = !producto.activo ? 'producto-inactivo' : '';
        const tipoBadge = producto.tipo === 'MAQUINARIA' ? 'badge-maquinaria' : 'badge-repuesto';
        
        // Mostrar estado o stock según tipo
        let estadoStock = '';
        if (producto.tipo === 'MAQUINARIA' && producto.estado) {
            const estadoClass = `badge-${producto.estado.toLowerCase()}`;
            estadoStock = `<span class="badge ${estadoClass}">${formatearEstado(producto.estado)}</span>`;
        } else if (producto.tipo === 'REPUESTO') {
            const stockClass = producto.stock > 0 ? 'badge-stock' : 'badge-sin-stock';
            estadoStock = `<span class="badge ${stockClass}">Stock: ${producto.stock || 0}</span>`;
        }
        
        return `
            <tr class="${inactivo}">
                <td><strong>${producto.codigo}</strong></td>
                <td>${producto.nombre}</td>
                <td><span class="badge ${tipoBadge}">${producto.tipo}</span></td>
                <td>${producto.categoria || '-'}</td>
                <td>${producto.ubicacion || '-'}</td>
                <td>${estadoStock || '-'}</td>
                <td>${formatearFecha(producto.fechaAdquisicion)}</td>
                <td>
                    <button class="btn btn-edit btn-sm me-1" onclick="editarProducto('${producto.id}')" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    ${producto.activo ? 
                        `<button class="btn btn-delete btn-sm" onclick="eliminarProducto('${producto.id}', '${producto.nombre}')" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>` :
                        `<button class="btn btn-activate btn-sm" onclick="activarProducto('${producto.id}')" title="Activar">
                            <i class="bi bi-check-circle"></i>
                        </button>`
                    }
                </td>
            </tr>
        `;
    }).join('');
}

// Abrir modal nuevo producto
function abrirModalNuevo() {
    productoEditando = null;
    document.getElementById('modalProductoTitulo').textContent = 'Nuevo Producto';
    document.getElementById('formProducto').reset();
    document.getElementById('productoId').value = '';
    toggleCamposCondicionales();
    modalProducto.show();
}

// Editar producto
async function editarProducto(id) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/productos/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const producto = await response.json();
            productoEditando = producto;
            
            document.getElementById('modalProductoTitulo').textContent = 'Editar Producto';
            document.getElementById('productoId').value = producto.id;
            document.getElementById('productoCodigo').value = producto.codigo;
            document.getElementById('productoTipo').value = producto.tipo;
            document.getElementById('productoNombre').value = producto.nombre;
            document.getElementById('productoDescripcion').value = producto.descripcion || '';
            document.getElementById('productoCategoria').value = producto.categoria || '';
            document.getElementById('productoUbicacion').value = producto.ubicacion || '';
            document.getElementById('productoFechaAdquisicion').value = producto.fechaAdquisicion || '';
            document.getElementById('productoObservaciones').value = producto.observaciones || '';
            
            // Campos condicionales
            toggleCamposCondicionales();
            
            if (producto.tipo === 'MAQUINARIA') {
                document.getElementById('productoTipoMaquinaria').value = producto.tipoMaquinaria || '';
                document.getElementById('productoEstado').value = producto.estado || '';
            } else {
                document.getElementById('productoStock').value = producto.stock || '';
            }
            
            modalProducto.show();
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar el producto');
    }
}

// Guardar producto
async function guardarProducto() {
    const form = document.getElementById('formProducto');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const tipo = document.getElementById('productoTipo').value;
    
    const producto = {
        codigo: document.getElementById('productoCodigo').value,
        tipo: tipo,
        nombre: document.getElementById('productoNombre').value,
        descripcion: document.getElementById('productoDescripcion').value,
        categoria: document.getElementById('productoCategoria').value,
        ubicacion: document.getElementById('productoUbicacion').value,
        fechaAdquisicion: document.getElementById('productoFechaAdquisicion').value || null,
        observaciones: document.getElementById('productoObservaciones').value,
        activo: true
    };
    
    // Campos condicionales
    if (tipo === 'MAQUINARIA') {
        producto.tipoMaquinaria = document.getElementById('productoTipoMaquinaria').value || null;
        producto.estado = document.getElementById('productoEstado').value || null;
        producto.stock = null;
    } else {
        producto.stock = parseInt(document.getElementById('productoStock').value) || 0;
        producto.tipoMaquinaria = null;
        producto.estado = null;
    }
    
    try {
        const token = localStorage.getItem('token');
        const productoId = document.getElementById('productoId').value;
        const url = productoId ? `/api/admin/productos/${productoId}` : '/api/admin/productos';
        const method = productoId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(producto)
        });
        
        if (response.ok) {
            modalProducto.hide();
            cargarProductos();
            cargarCategorias();
            cargarUbicaciones();
            alert(productoId ? 'Producto actualizado correctamente' : 'Producto creado correctamente');
        } else {
            const error = await response.text();
            alert('Error: ' + error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar el producto');
    }
}

// Eliminar producto
function eliminarProducto(id, nombre) {
    productoEditando = { id, nombre };
    document.getElementById('nombreProductoEliminar').textContent = nombre;
    modalEliminar.show();
}

// Confirmar eliminación
async function confirmarEliminar() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/productos/${productoEditando.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            modalEliminar.hide();
            cargarProductos();
            alert('Producto eliminado correctamente');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar el producto');
    }
}

// Activar producto
async function activarProducto(id) {
    if (!confirm('¿Desea reactivar este producto?')) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/productos/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const producto = await response.json();
            producto.activo = true;
            
            const updateResponse = await fetch(`/api/admin/productos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(producto)
            });
            
            if (updateResponse.ok) {
                cargarProductos();
                alert('Producto reactivado correctamente');
            }
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al activar el producto');
    }
}

// Toggle campos condicionales
function toggleCamposCondicionales() {
    const tipo = document.getElementById('productoTipo').value;
    const grupoTipoMaquinaria = document.getElementById('grupoTipoMaquinaria');
    const grupoEstado = document.getElementById('grupoEstado');
    const grupoStock = document.getElementById('grupoStock');
    
    if (tipo === 'MAQUINARIA') {
        grupoTipoMaquinaria.style.display = 'block';
        grupoEstado.style.display = 'block';
        grupoStock.style.display = 'none';
        document.getElementById('productoStock').value = '';
    } else if (tipo === 'REPUESTO') {
        grupoTipoMaquinaria.style.display = 'none';
        grupoEstado.style.display = 'none';
        grupoStock.style.display = 'block';
        document.getElementById('productoTipoMaquinaria').value = '';
        document.getElementById('productoEstado').value = '';
    } else {
        grupoTipoMaquinaria.style.display = 'none';
        grupoEstado.style.display = 'none';
        grupoStock.style.display = 'none';
    }
}

// Autocompletado de nombres
async function autocompletarNombres(e) {
    const query = e.target.value;
    if (query.length < 2) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/productos/buscar?q=${encodeURIComponent(query)}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const nombres = await response.json();
            const datalist = document.getElementById('nombresExistentes');
            datalist.innerHTML = nombres.map(n => `<option value="${n}">`).join('');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Cargar categorías para autocompletado
async function cargarCategorias() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/productos/categorias', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const categorias = await response.json();
            
            // Llenar datalist
            const datalist = document.getElementById('categoriasExistentes');
            datalist.innerHTML = categorias.map(c => `<option value="${c}">`).join('');
            
            // Llenar filtro
            const filtro = document.getElementById('filtroCategoria');
            const opcionesActuales = Array.from(filtro.options).map(o => o.value);
            categorias.forEach(cat => {
                if (!opcionesActuales.includes(cat)) {
                    const option = document.createElement('option');
                    option.value = cat;
                    option.textContent = cat;
                    filtro.appendChild(option);
                }
            });
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Cargar ubicaciones para autocompletado
async function cargarUbicaciones() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/productos/ubicaciones', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const ubicaciones = await response.json();
            const datalist = document.getElementById('ubicacionesExistentes');
            datalist.innerHTML = ubicaciones.map(u => `<option value="${u}">`).join('');
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
    const filtroActivo = document.getElementById('filtroActivo').value;
    
    const productosFiltrados = productos.filter(producto => {
        const matchBusqueda = !busqueda || 
            producto.nombre.toLowerCase().includes(busqueda) ||
            producto.codigo.toLowerCase().includes(busqueda) ||
            (producto.descripcion && producto.descripcion.toLowerCase().includes(busqueda));
        
        const matchTipo = !filtroTipo || producto.tipo === filtroTipo;
        const matchCategoria = !filtroCategoria || producto.categoria === filtroCategoria;
        const matchEstado = !filtroEstado || producto.estado === filtroEstado;
        const matchActivo = filtroActivo === '' || producto.activo === (filtroActivo === 'true');
        
        return matchBusqueda && matchTipo && matchCategoria && matchEstado && matchActivo;
    });
    
    mostrarProductos(productosFiltrados);
}

// Formatear fecha
function formatearFecha(fecha) {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Formatear estado
function formatearEstado(estado) {
    const estados = {
        'FUNCIONANDO': 'Funcionando',
        'MANTENIMIENTO': 'Mantenimiento',
        'REVISION': 'Revisión',
        'BAJA': 'Baja'
    };
    return estados[estado] || estado;
}

// Cerrar sesión
function cerrarSesion() {
    localStorage.clear();
    window.location.href = '/index.html';
}
