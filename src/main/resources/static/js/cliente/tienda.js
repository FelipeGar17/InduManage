// js/cliente/tienda.js

const API_URL = '/api';
let productos = [];
let productosFiltrados = [];
let productoSeleccionado = null;
let modalDetalle;

// Carrito (localStorage)
let carrito = JSON.parse(localStorage.getItem('carrito') || '[]');

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    verificarAutenticacion();
    
    modalDetalle = new bootstrap.Modal(document.getElementById('modalDetalle'));
    
    // Event Listeners
    document.getElementById('logoutBtn').addEventListener('click', cerrarSesion);
    document.getElementById('sidebarToggle')?.addEventListener('click', toggleSidebar);
    document.getElementById('buscarProducto').addEventListener('input', filtrarProductos);
    document.getElementById('filtroTipo').addEventListener('change', filtrarProductos);
    document.getElementById('filtroCategoria').addEventListener('change', filtrarProductos);
    document.getElementById('btnLimpiar').addEventListener('click', limpiarFiltros);
    document.getElementById('btnAgregarCarrito').addEventListener('click', agregarAlCarrito);
    
    // Fecha mínima para alquiler (hoy)
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('fechaInicio').min = hoy;
    document.getElementById('fechaFin').min = hoy;
    
    // Calcular días al cambiar fechas
    document.getElementById('fechaInicio').addEventListener('change', calcularDiasAlquiler);
    document.getElementById('fechaFin').addEventListener('change', calcularDiasAlquiler);
    
    // Cargar datos
    cargarProductos();
    actualizarContadorCarrito();
});

function verificarAutenticacion() {
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    
    if (!token || usuario.rol !== 'CLIENTE') {
        window.location.href = '/index.html';
        return;
    }
    
    document.getElementById('userName').textContent = usuario.nombre;
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
}

async function cargarProductos() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/cliente/productos`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            productos = await response.json();
            
            // DEBUG: Imprimir productos en consola para ver los datos
            console.log('Productos cargados:', productos);
            console.log('Ejemplo de producto:', productos[0]);
            
            // Filtrar solo productos disponibles para venta
            productos = productos.filter(p => p.disponibleVenta === true);
            productosFiltrados = [...productos];
            mostrarProductos();
            cargarCategorias();
        }
    } catch (error) {
        console.error('Error al cargar productos:', error);
        alert('Error al cargar productos');
    }
}

function mostrarProductos() {
    const repuestos = productosFiltrados.filter(p => p.tipo === 'REPUESTO');
    const maquinaria = productosFiltrados.filter(p => p.tipo === 'MAQUINARIA');
    
    mostrarGrupoProductos(repuestos, 'productosRepuestos', 'emptyRepuestos');
    mostrarGrupoProductos(maquinaria, 'productosMaquinaria', 'emptyMaquinaria');
}

function obtenerImagenUrl(producto) {
    // DEBUG: Ver qué URL tiene el producto
    console.log(`Producto: ${producto.nombre}, imagenUrl:`, producto.imagenUrl);
    
    // Verificar si tiene imagenUrl válida
    if (producto.imagenUrl && 
        typeof producto.imagenUrl === 'string' && 
        producto.imagenUrl.trim() !== '' &&
        producto.imagenUrl !== 'null' &&
        producto.imagenUrl !== 'undefined') {
        return producto.imagenUrl.trim();
    }
    
    return null;
}

function crearImagenHtml(producto) {
    const imagenUrl = obtenerImagenUrl(producto);
    
    if (imagenUrl) {
        return `
            <img src="${imagenUrl}" 
                 class="product-image" 
                 alt="${producto.nombre}"
                 onload="console.log('Imagen cargada:', '${imagenUrl}')"
                 onerror="console.error('Error al cargar imagen:', '${imagenUrl}'); this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="product-image-placeholder" style="display:none;">
                <i class="bi bi-image"></i>
                <span>Imagen no disponible</span>
            </div>
        `;
    } else {
        return `
            <div class="product-image-placeholder">
                <i class="bi bi-image"></i>
                <span>Sin imagen</span>
            </div>
        `;
    }
}

function mostrarGrupoProductos(listaProductos, containerId, emptyId) {
    const container = document.getElementById(containerId);
    const empty = document.getElementById(emptyId);
    
    if (listaProductos.length === 0) {
        container.innerHTML = '';
        empty.classList.remove('d-none');
        return;
    }
    
    empty.classList.add('d-none');
    
    container.innerHTML = listaProductos.map(producto => {
        const sinStock = producto.tipo === 'REPUESTO' && (!producto.stock || producto.stock === 0);
        const disponible = producto.tipo === 'REPUESTO' ? !sinStock : producto.disponibleVenta;
        
        return `
        <div class="col-md-4 col-lg-3">
            <div class="product-card">
                <div class="product-image-container">
                    ${crearImagenHtml(producto)}
                    ${sinStock ? `
                        <div class="product-badge-overlay">
                            <span class="badge badge-sin-stock">Sin stock</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="product-body">
                    <span class="badge ${producto.tipo === 'REPUESTO' ? 'badge-tipo-repuesto' : 'badge-tipo-maquinaria'} mb-2">
                        ${producto.tipo === 'REPUESTO' ? 'Repuesto' : 'Maquinaria'}
                    </span>
                    
                    <h5 class="product-title" title="${producto.nombre}">${producto.nombre}</h5>
                    <p class="product-code">Código: ${producto.codigo}</p>
                    
                    ${producto.categoria ? `
                        <div class="product-category">
                            <i class="bi bi-tag"></i>
                            <span>${producto.categoria}</span>
                        </div>
                    ` : ''}
                    
                    ${producto.tipo === 'REPUESTO' ? `
                        <div class="product-price">$${(producto.precio || 0).toFixed(2)}</div>
                        <div class="product-stock">
                            <span class="badge ${getStockBadge(producto.stock, producto.stockMinimo)}">
                                Stock: ${producto.stock || 0}
                            </span>
                        </div>
                    ` : `
                        <div class="product-price">$${(producto.precioAlquilerDia || 0).toFixed(2)}<span style="font-size: 0.7rem; font-weight: normal;">/día</span></div>
                        <div class="product-price-detail">
                            <i class="bi bi-calendar-week"></i> Semana: $${(producto.precioAlquilerSemana || 0).toFixed(2)}<br>
                            <i class="bi bi-calendar-month"></i> Mes: $${(producto.precioAlquilerMes || 0).toFixed(2)}
                        </div>
                    `}
                    
                    <div class="product-footer mt-3">
                        <button class="btn-detalle" onclick="verDetalle('${producto.id}')">
                            <i class="bi bi-eye"></i>
                            <span>Ver detalles</span>
                        </button>
                        ${disponible ? `
                            <button class="btn-quick-add" onclick="agregarRapido('${producto.id}')" title="Agregar rápido">
                                <i class="bi bi-cart-plus"></i>
                            </button>
                        ` : `
                            <button class="btn-quick-add" disabled title="No disponible">
                                <i class="bi bi-cart-x"></i>
                            </button>
                        `}
                    </div>
                </div>
            </div>
        </div>
    `;
    }).join('');
}

function getStockBadge(stock, stockMinimo) {
    if (!stock || stock === 0) return 'badge-sin-stock';
    if (stock <= (stockMinimo || 5)) return 'badge-stock-bajo';
    return 'badge-stock-ok';
}

async function verDetalle(productoId) {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;
    
    productoSeleccionado = producto;
    
    // DEBUG
    console.log('Producto seleccionado:', producto);
    console.log('URL de imagen:', producto.imagenUrl);
    
    const modalTitle = producto.tipo === 'REPUESTO' ? 'Detalles del Repuesto' : 'Detalles de la Maquinaria';
    document.getElementById('modalTitulo').textContent = modalTitle;
    document.getElementById('modalNombre').textContent = producto.nombre;
    document.getElementById('modalCodigo').textContent = `Código: ${producto.codigo}`;
    
    // Descripción
    const descripcion = producto.descripcion && producto.descripcion.trim() !== '' 
        ? producto.descripcion 
        : 'Sin descripción disponible';
    document.getElementById('modalDescripcion').textContent = descripcion;
    document.getElementById('modalDescripcion').className = 'modal-product-description';
    
    // Imagen con manejo de errores mejorado
    const modalImagen = document.getElementById('modalImagen');
    const imagenUrl = obtenerImagenUrl(producto);
    
    if (imagenUrl) {
        console.log('Cargando imagen en modal:', imagenUrl);
        modalImagen.src = imagenUrl;
        modalImagen.style.display = 'block';
        
        modalImagen.onload = function() {
            console.log('Imagen del modal cargada exitosamente');
        };
        
        modalImagen.onerror = function() {
            console.error('Error al cargar imagen del modal:', imagenUrl);
            // Imagen de fallback con SVG
            this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23f5f5f5" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="20" x="50%25" y="45%25" text-anchor="middle" dominant-baseline="middle"%3EImagen no disponible%3C/text%3E%3Ctext fill="%23bbb" font-family="sans-serif" font-size="14" x="50%25" y="55%25" text-anchor="middle" dominant-baseline="middle"%3E(URL inválida o error de carga)%3C/text%3E%3C/svg%3E';
        };
    } else {
        console.log('No hay URL de imagen para este producto');
        // SVG placeholder
        modalImagen.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23f5f5f5" width="400" height="300"/%3E%3Cg%3E%3Crect x="150" y="100" width="100" height="80" fill="%23ddd" rx="5"/%3E%3Ccircle cx="175" cy="130" r="10" fill="%23bbb"/%3E%3Cpath d="M 160 160 L 180 145 L 200 155 L 240 140" stroke="%23bbb" stroke-width="3" fill="none"/%3E%3C/g%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" x="50%25" y="70%25" text-anchor="middle"%3ESin imagen%3C/text%3E%3C/svg%3E';
        modalImagen.style.display = 'block';
    }
    
    if (producto.tipo === 'REPUESTO') {
        document.getElementById('seccionRepuesto').style.display = 'block';
        document.getElementById('seccionMaquinaria').style.display = 'none';
        document.getElementById('stockDisponible').textContent = producto.stock || 0;
        document.getElementById('cantidadRepuesto').max = producto.stock || 0;
        document.getElementById('cantidadRepuesto').value = 1;
        
        const precioUnitario = producto.precio || 0;
        document.getElementById('infoPrecio').innerHTML = `
            <h4 class="text-warning mb-3">$${precioUnitario.toFixed(2)}</h4>
            ${producto.categoria ? `<p class="mb-2"><i class="bi bi-tag me-2"></i><strong>Categoría:</strong> ${producto.categoria}</p>` : ''}
            ${producto.ubicacion ? `<p class="mb-2"><i class="bi bi-geo-alt me-2"></i><strong>Ubicación:</strong> ${producto.ubicacion}</p>` : ''}
        `;
    } else {
        document.getElementById('seccionRepuesto').style.display = 'none';
        document.getElementById('seccionMaquinaria').style.display = 'block';
        
        const precioDia = producto.precioAlquilerDia || 0;
        const precioSemana = producto.precioAlquilerSemana || 0;
        const precioMes = producto.precioAlquilerMes || 0;
        
        document.getElementById('infoPrecio').innerHTML = `
            <div class="mb-3">
                <h5 class="mb-3">Precios de Alquiler:</h5>
                <div class="mb-2">
                    <i class="bi bi-calendar-day me-2 text-warning"></i>
                    <strong>Por día:</strong> 
                    <span class="text-warning fs-5">$${precioDia.toFixed(2)}</span>
                </div>
                <div class="mb-2">
                    <i class="bi bi-calendar-week me-2 text-primary"></i>
                    <strong>Por semana:</strong> 
                    <span class="text-primary fs-5">$${precioSemana.toFixed(2)}</span>
                </div>
                <div class="mb-2">
                    <i class="bi bi-calendar-month me-2 text-success"></i>
                    <strong>Por mes:</strong> 
                    <span class="text-success fs-5">$${precioMes.toFixed(2)}</span>
                </div>
            </div>
            ${producto.categoria ? `<p class="mb-2"><i class="bi bi-tag me-2"></i><strong>Categoría:</strong> ${producto.categoria}</p>` : ''}
            ${producto.ubicacion ? `<p class="mb-2"><i class="bi bi-geo-alt me-2"></i><strong>Ubicación:</strong> ${producto.ubicacion}</p>` : ''}
            ${producto.tipoMaquinaria ? `<p class="mb-2"><i class="bi bi-tools me-2"></i><strong>Tamaño:</strong> ${producto.tipoMaquinaria}</p>` : ''}
        `;
        
        // Limpiar fechas
        document.getElementById('fechaInicio').value = '';
        document.getElementById('fechaFin').value = '';
        document.getElementById('resumenAlquiler').style.display = 'none';
    }
    
    modalDetalle.show();
}

function calcularDiasAlquiler() {
    const fechaInicio = document.getElementById('fechaInicio').value;
    const fechaFin = document.getElementById('fechaFin').value;
    
    if (!fechaInicio || !fechaFin || !productoSeleccionado) return;
    
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    if (fin < inicio) {
        alert('La fecha de fin debe ser posterior a la fecha de inicio');
        document.getElementById('fechaFin').value = '';
        document.getElementById('resumenAlquiler').style.display = 'none';
        return;
    }
    
    const dias = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24)) + 1;
    const total = dias * (productoSeleccionado.precioAlquilerDia || 0);
    
    document.getElementById('diasTotal').textContent = dias;
    document.getElementById('totalAlquiler').textContent = `$${total.toFixed(2)}`;
    document.getElementById('resumenAlquiler').style.display = 'block';
}

function agregarAlCarrito() {
    if (!productoSeleccionado) return;
    
    const item = {
        productoId: productoSeleccionado.id,
        productoCodigo: productoSeleccionado.codigo,
        productoNombre: productoSeleccionado.nombre,
        tipoProducto: productoSeleccionado.tipo,
        imagenUrl: productoSeleccionado.imagenUrl || null
    };
    
    if (productoSeleccionado.tipo === 'REPUESTO') {
        const cantidad = parseInt(document.getElementById('cantidadRepuesto').value);
        if (cantidad <= 0 || cantidad > productoSeleccionado.stock) {
            alert('Cantidad no válida');
            return;
        }
        item.cantidad = cantidad;
        item.precioUnitario = productoSeleccionado.precio;
        item.subtotal = cantidad * productoSeleccionado.precio;
        item.total = item.subtotal;
    } else {
        const fechaInicio = document.getElementById('fechaInicio').value;
        const fechaFin = document.getElementById('fechaFin').value;
        
        if (!fechaInicio || !fechaFin) {
            alert('Selecciona las fechas de alquiler');
            return;
        }
        
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        const dias = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24)) + 1;
        
        item.fechaInicio = fechaInicio;
        item.fechaFin = fechaFin;
        item.diasAlquiler = dias;
        item.precioDiario = productoSeleccionado.precioAlquilerDia;
        item.totalAlquiler = dias * productoSeleccionado.precioAlquilerDia;
        item.total = item.totalAlquiler;
    }
    
    carrito.push(item);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    
    modalDetalle.hide();
    actualizarContadorCarrito();
    
    mostrarNotificacion('Producto agregado al carrito', 'success');
}

function agregarRapido(productoId) {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;
    
    if (producto.tipo === 'REPUESTO') {
        if (!producto.stock || producto.stock <= 0) {
            mostrarNotificacion('Producto sin stock', 'error');
            return;
        }
        
        const item = {
            productoId: producto.id,
            productoCodigo: producto.codigo,
            productoNombre: producto.nombre,
            tipoProducto: 'REPUESTO',
            cantidad: 1,
            precioUnitario: producto.precio,
            subtotal: producto.precio,
            total: producto.precio,
            imagenUrl: producto.imagenUrl || null
        };
        
        carrito.push(item);
        localStorage.setItem('carrito', JSON.stringify(carrito));
        actualizarContadorCarrito();
        mostrarNotificacion('Producto agregado al carrito', 'success');
    } else {
        verDetalle(productoId);
    }
}

function actualizarContadorCarrito() {
    const count = carrito.length;
    document.getElementById('carritoCount').textContent = count;
    document.getElementById('carritoTopCount').textContent = count;
}

function filtrarProductos() {
    const buscar = document.getElementById('buscarProducto').value.toLowerCase().trim();
    const tipo = document.getElementById('filtroTipo').value;
    const categoria = document.getElementById('filtroCategoria').value;
    
    productosFiltrados = productos.filter(p => {
        const matchBuscar = !buscar || 
            (p.nombre && p.nombre.toLowerCase().includes(buscar)) ||
            (p.codigo && p.codigo.toLowerCase().includes(buscar)) ||
            (p.descripcion && p.descripcion.toLowerCase().includes(buscar)) ||
            (p.categoria && p.categoria.toLowerCase().includes(buscar));
        
        const matchTipo = !tipo || p.tipo === tipo;
        const matchCategoria = !categoria || p.categoria === categoria;
        
        return matchBuscar && matchTipo && matchCategoria;
    });
    
    mostrarProductos();
}

function limpiarFiltros() {
    document.getElementById('buscarProducto').value = '';
    document.getElementById('filtroTipo').value = '';
    document.getElementById('filtroCategoria').value = '';
    productosFiltrados = [...productos];
    mostrarProductos();
}

function cargarCategorias() {
    const categorias = [...new Set(productos.map(p => p.categoria).filter(c => c))];
    const select = document.getElementById('filtroCategoria');
    
    while (select.options.length > 1) {
        select.remove(1);
    }
    
    categorias.sort().forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
    });
}

function mostrarNotificacion(mensaje, tipo) {
    const toastContainer = document.getElementById('toastContainer') || crearToastContainer();
    
    const toastId = 'toast-' + Date.now();
    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-white bg-${tipo === 'success' ? 'success' : 'danger'} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="bi bi-${tipo === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>
                    ${mensaje}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
    toast.show();
    
    toastElement.addEventListener('hidden.bs.toast', function() {
        toastElement.remove();
    });
}

function crearToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    return container;
}

function cerrarSesion() {
    localStorage.clear();
    window.location.href = '/index.html';
}