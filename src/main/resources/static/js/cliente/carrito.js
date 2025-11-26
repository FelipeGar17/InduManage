// js/cliente/carrito.js

const API_URL = 'https://indumanage-production.up.railway.app/api';
let carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
let modalConfirmacion;

document.addEventListener('DOMContentLoaded', function() {
    verificarAutenticacion();
    
    modalConfirmacion = new bootstrap.Modal(document.getElementById('modalConfirmacion'));
    
    // Event Listeners
    document.getElementById('logoutBtn').addEventListener('click', cerrarSesion);
    document.getElementById('sidebarToggle')?.addEventListener('click', toggleSidebar);
    document.getElementById('btnVaciarCarrito').addEventListener('click', vaciarCarrito);
    document.getElementById('btnProcesarOrden').addEventListener('click', procesarOrden);
    document.getElementById('metodoEntrega').addEventListener('change', toggleDireccionEntrega);
    
    // Mostrar carrito
    mostrarCarrito();
    actualizarResumen();
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

function toggleDireccionEntrega() {
    const metodo = document.getElementById('metodoEntrega').value;
    document.getElementById('direccionEntregaDiv').style.display = 
        metodo === 'ENVIO_DOMICILIO' ? 'block' : 'none';
}

function obtenerImagenProducto(item) {
    // Prioridad: imagenUrl del item > placeholder con nombre > placeholder genérico
    if (item.imagenUrl && item.imagenUrl.trim() !== '') {
        return item.imagenUrl;
    }
    
    // Placeholder mejorado con el nombre del producto
    const nombreEncoded = encodeURIComponent(item.productoNombre || item.tipoProducto);
    return `https://via.placeholder.com/120x120/6c757d/ffffff?text=${nombreEncoded}`;
}

function manejarErrorImagen(img) {
    // Fallback si la imagen falla al cargar
    const item = img.dataset;
    const placeholder = `https://via.placeholder.com/120x120/6c757d/ffffff?text=${item.tipo || 'Producto'}`;
    img.src = placeholder;
    img.onerror = null; // Evitar loop infinito
}

function mostrarCarrito() {
    const listaCarrito = document.getElementById('listaCarrito');
    const carritoVacio = document.getElementById('carritoVacio');
    const carritoCount = document.getElementById('carritoCount');
    
    carritoCount.textContent = carrito.length;
    
    if (carrito.length === 0) {
        listaCarrito.innerHTML = '';
        carritoVacio.classList.remove('d-none');
        document.getElementById('btnProcesarOrden').disabled = true;
        return;
    }
    
    carritoVacio.classList.add('d-none');
    document.getElementById('btnProcesarOrden').disabled = false;
    
    listaCarrito.innerHTML = carrito.map((item, index) => `
        <div class="cart-item">
            <img src="${obtenerImagenProducto(item)}" 
                 class="cart-item-image" 
                 alt="${item.productoNombre || 'Producto'}"
                 data-tipo="${item.tipoProducto}"
                 onerror="manejarErrorImagen(this)"
                 loading="lazy">
            
            <div class="cart-item-details">
                <span class="cart-item-type ${item.tipoProducto === 'REPUESTO' ? 'type-repuesto' : 'type-maquinaria'}">
                    ${item.tipoProducto === 'REPUESTO' ? 'Repuesto' : 'Maquinaria'}
                </span>
                <h5 class="cart-item-title">${item.productoNombre || 'Sin nombre'}</h5>
                <p class="cart-item-code">Código: ${item.productoCodigo || 'N/A'}</p>
                
                ${item.tipoProducto === 'REPUESTO' ? renderRepuestoInfo(item, index) : renderMaquinariaInfo(item)}
                
                <div class="cart-item-price">
                    Total: $${(item.total || 0).toFixed(2)}
                </div>
            </div>
            
            <div class="cart-item-actions">
                <button class="btn-remove" onclick="eliminarItem(${index})" title="Eliminar del carrito">
                    <i class="bi bi-trash me-1"></i>Eliminar
                </button>
            </div>
        </div>
    `).join('');
}

function renderRepuestoInfo(item, index) {
    return `
        <div class="cart-item-info">
            Precio unitario: $${(item.precioUnitario || 0).toFixed(2)}
        </div>
        <div class="quantity-control">
            <button onclick="cambiarCantidad(${index}, -1)" 
                    title="Disminuir cantidad"
                    ${item.cantidad <= 1 ? 'disabled' : ''}>
                <i class="bi bi-dash"></i>
            </button>
            <input type="number" 
                   value="${item.cantidad || 1}" 
                   min="1" 
                   max="${item.stockDisponible || 999}"
                   readonly>
            <button onclick="cambiarCantidad(${index}, 1)" 
                    title="Aumentar cantidad"
                    ${item.cantidad >= (item.stockDisponible || 999) ? 'disabled' : ''}>
                <i class="bi bi-plus"></i>
            </button>
        </div>
        ${item.stockDisponible && item.cantidad >= item.stockDisponible ? 
            '<small class="text-warning"><i class="bi bi-exclamation-triangle"></i> Stock máximo alcanzado</small>' : ''}
    `;
}

function renderMaquinariaInfo(item) {
    return `
        <div class="cart-item-info">
            <i class="bi bi-calendar-check me-1"></i>
            ${formatearFecha(item.fechaInicio)} al ${formatearFecha(item.fechaFin)}
        </div>
        <div class="cart-item-info">
            <i class="bi bi-clock me-1"></i>
            ${item.diasAlquiler || 0} día(s) - $${(item.precioDiario || 0).toFixed(2)}/día
        </div>
    `;
}

function cambiarCantidad(index, cambio) {
    const item = carrito[index];
    const nuevaCantidad = item.cantidad + cambio;
    
    // Validar cantidad mínima
    if (nuevaCantidad <= 0) {
        eliminarItem(index);
        return;
    }
    
    // Validar stock disponible
    if (item.stockDisponible && nuevaCantidad > item.stockDisponible) {
        mostrarNotificacion('No hay suficiente stock disponible', 'warning');
        return;
    }
    
    // Actualizar item
    item.cantidad = nuevaCantidad;
    item.subtotal = item.cantidad * (item.precioUnitario || 0);
    item.total = item.subtotal;
    
    guardarCarrito();
    mostrarCarrito();
    actualizarResumen();
    
    mostrarNotificacion('Cantidad actualizada', 'success', 1000);
}

function eliminarItem(index) {
    if (confirm('¿Eliminar este producto del carrito?')) {
        const itemEliminado = carrito[index];
        carrito.splice(index, 1);
        guardarCarrito();
        mostrarCarrito();
        actualizarResumen();
        
        mostrarNotificacion(`${itemEliminado.productoNombre} eliminado del carrito`, 'info');
    }
}

function vaciarCarrito() {
    if (carrito.length === 0) {
        mostrarNotificacion('El carrito ya está vacío', 'info');
        return;
    }
    
    if (confirm('¿Vaciar todo el carrito?')) {
        carrito = [];
        guardarCarrito();
        mostrarCarrito();
        actualizarResumen();
        
        mostrarNotificacion('Carrito vaciado', 'success');
    }
}

function actualizarResumen() {
    const subtotal = carrito.reduce((sum, item) => sum + (item.total || 0), 0);
    const iva = subtotal * 0.19;
    const total = subtotal + iva;
    
    document.getElementById('resumenSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('resumenIVA').textContent = `$${iva.toFixed(2)}`;
    document.getElementById('resumenTotal').textContent = `$${total.toFixed(2)}`;
}

async function procesarOrden() {
    if (carrito.length === 0) {
        mostrarNotificacion('El carrito está vacío', 'warning');
        return;
    }
    
    const metodoEntrega = document.getElementById('metodoEntrega').value;
    const direccionEntrega = document.getElementById('direccionEntrega').value;
    const observaciones = document.getElementById('observaciones').value;
    
    // Validar dirección si es envío a domicilio
    if (metodoEntrega === 'ENVIO_DOMICILIO' && !direccionEntrega.trim()) {
        mostrarNotificacion('Por favor ingresa la dirección de entrega', 'warning');
        document.getElementById('direccionEntrega').focus();
        return;
    }
    
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const token = localStorage.getItem('token');
    
    const orden = {
        items: carrito,
        observacionesCliente: observaciones.trim() || null,
        direccionEntrega: metodoEntrega === 'ENVIO_DOMICILIO' ? direccionEntrega.trim() : null,
        metodoEntrega: metodoEntrega
    };
    
    const btnProcesar = document.getElementById('btnProcesarOrden');
    const btnOriginalHTML = btnProcesar.innerHTML;
    
    try {
        btnProcesar.disabled = true;
        btnProcesar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Procesando...';
        
        const response = await fetch(`${API_URL}/cliente/ordenes?clienteId=${usuario.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orden)
        });
        
        if (response.ok) {
            const ordenCreada = await response.json();
            
            // Limpiar carrito
            carrito = [];
            guardarCarrito();
            mostrarCarrito();
            actualizarResumen();
            
            // Mostrar modal de confirmación
            document.getElementById('numeroOrden').textContent = ordenCreada.numeroOrden || 'N/A';
            modalConfirmacion.show();
            
            // Resetear formulario
            document.getElementById('metodoEntrega').value = 'RETIRO_LOCAL';
            document.getElementById('direccionEntrega').value = '';
            document.getElementById('observaciones').value = '';
            toggleDireccionEntrega();
            
        } else {
            const error = await response.json();
            mostrarNotificacion('Error al crear la orden: ' + (error.message || 'Error desconocido'), 'danger');
        }
    } catch (error) {
        console.error('Error al procesar orden:', error);
        mostrarNotificacion('Error de conexión. Por favor intenta nuevamente.', 'danger');
    } finally {
        btnProcesar.disabled = false;
        btnProcesar.innerHTML = btnOriginalHTML;
    }
}

function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    
    // Emitir evento personalizado para que otros componentes sepan que el carrito cambió
    window.dispatchEvent(new CustomEvent('carritoActualizado', { 
        detail: { items: carrito.length } 
    }));
}

function formatearFecha(fecha) {
    if (!fecha) return 'N/A';
    
    try {
        const date = new Date(fecha);
        if (isNaN(date.getTime())) return 'Fecha inválida';
        
        return date.toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
    } catch (error) {
        console.error('Error al formatear fecha:', error);
        return 'N/A';
    }
}

function mostrarNotificacion(mensaje, tipo = 'info', duracion = 3000) {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = `alert alert-${tipo} alert-dismissible fade show notification-toast`;
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    
    notificacion.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notificacion);
    
    // Auto-remover después de la duración especificada
    setTimeout(() => {
        notificacion.classList.remove('show');
        setTimeout(() => notificacion.remove(), 150);
    }, duracion);
}

function cerrarSesion() {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
        localStorage.clear();
        window.location.href = '/index.html';
    }
}

// Escuchar cambios en el carrito desde otras pestañas
window.addEventListener('storage', (e) => {
    if (e.key === 'carrito') {
        carrito = JSON.parse(e.newValue || '[]');
        mostrarCarrito();
        actualizarResumen();
    }
});