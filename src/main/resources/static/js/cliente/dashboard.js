// Dashboard Cliente - InduManage
const API_URL = 'https://indumanage-production.up.railway.app/api';
let usuarioActual = null;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    verificarAutenticacion();
    cargarDatosUsuario();
    cargarProductosDestacados();
    actualizarContadorCarrito();
    configurarEventListeners();
});

// Verificar autenticación
function verificarAutenticacion() {
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    
    if (!token || usuario.rol !== 'CLIENTE') {
        window.location.href = '../index.html';
        return;
    }
    
    usuarioActual = usuario;
}

// Cargar datos del usuario
function cargarDatosUsuario() {
    if (usuarioActual) {
        const nombreCompleto = `${usuarioActual.nombre} ${usuarioActual.apellido || ''}`.trim();
        document.getElementById('userName').textContent = nombreCompleto || 'Usuario';
    }
}

// Configurar event listeners
function configurarEventListeners() {
    // Logout
    document.getElementById('btnLogout').addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            localStorage.removeItem('carrito');
            window.location.href = '../index.html';
        }
    });
}

// Cargar productos destacados
async function cargarProductosDestacados() {
    const container = document.getElementById('productosDestacados');
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/cliente/productos`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Error al cargar productos');
        
        const productos = await response.json();
        
        // Tomar los primeros 3 productos
        const destacados = productos.slice(0, 3);
        
        if (destacados.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-4">
                    <p class="text-muted">No hay productos disponibles</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = destacados.map(producto => crearTarjetaProducto(producto)).join('');
        
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = `
            <div class="col-12 text-center py-4">
                <p class="text-danger">Error al cargar productos destacados</p>
                <button class="btn btn-primary btn-sm" onclick="cargarProductosDestacados()">
                    <i class="bi bi-arrow-clockwise me-1"></i>Reintentar
                </button>
            </div>
        `;
    }
}

// Crear tarjeta de producto
function crearTarjetaProducto(producto) {
    const badgeClass = producto.tipo === 'MAQUINARIA' ? 'badge-maquinaria' : 'badge-repuesto';
    const imagen = producto.imagenUrl || getImagenPorDefecto(producto.tipo);
    
    let precioHTML = '';
    let disponibilidadHTML = '';
    
    if (producto.tipo === 'MAQUINARIA') {
        precioHTML = `
            <div class="product-price">$${formatearPrecio(producto.precioAlquilerDia)}</div>
            <span class="product-price-label">por día</span>
        `;
        disponibilidadHTML = producto.disponibleVenta 
            ? '<span class="product-disponible"><i class="bi bi-check-circle me-1"></i>Disponible</span>'
            : '<span class="product-stock-out"><i class="bi bi-x-circle me-1"></i>No disponible</span>';
    } else {
        precioHTML = `
            <div class="product-price">$${formatearPrecio(producto.precio)}</div>
            <span class="product-price-label">precio unitario</span>
        `;
        if (producto.stock > 0) {
            if (producto.stock <= (producto.stockMinimo || 10)) {
                disponibilidadHTML = `<span class="product-stock-low"><i class="bi bi-exclamation-triangle me-1"></i>Stock bajo (${producto.stock})</span>`;
            } else {
                disponibilidadHTML = `<span class="product-disponible"><i class="bi bi-check-circle me-1"></i>Stock: ${producto.stock}</span>`;
            }
        } else {
            disponibilidadHTML = '<span class="product-stock-out"><i class="bi bi-x-circle me-1"></i>Sin stock</span>';
        }
    }
    
    return `
        <div class="col-md-4">
            <div class="product-card" onclick="verProducto('${producto.id}')">
                <div class="product-image">
                    <img src="${imagen}" alt="${producto.nombre}">
                    <span class="product-badge ${badgeClass}">${producto.tipo}</span>
                </div>
                <div class="product-body">
                    <p class="product-code"><i class="bi bi-upc me-1"></i>${producto.codigo}</p>
                    <h5 class="product-title">${producto.nombre}</h5>
                    <p class="product-category"><i class="bi bi-tag me-1"></i>${producto.categoria || 'Sin categoría'}</p>
                    ${precioHTML}
                    <div class="mt-2 mb-3">
                        ${disponibilidadHTML}
                    </div>
                    <button class="btn btn-add-cart" onclick="event.stopPropagation(); agregarAlCarritoRapido('${producto.id}')">
                        <i class="bi bi-cart-plus me-2"></i>Ver Producto
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Ver producto (redirige a tienda con modal)
function verProducto(productoId) {
    window.location.href = `tienda.html?producto=${productoId}`;
}

// Agregar al carrito rápido
function agregarAlCarritoRapido(productoId) {
    window.location.href = `tienda.html?producto=${productoId}`;
}

// Actualizar contador del carrito
function actualizarContadorCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito') || '{"items":[]}');
    const count = carrito.items.length;
    document.getElementById('cartCount').textContent = count;
}

// Formatear precio
function formatearPrecio(precio) {
    if (!precio) return '0.00';
    return parseFloat(precio).toFixed(2);
}

// Obtener imagen por defecto según tipo
function getImagenPorDefecto(tipo) {
    if (tipo === 'MAQUINARIA') {
        return 'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=400&h=300&fit=crop';
    } else {
        return 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300&fit=crop';
    }
}

// Exponer funciones globalmente
window.verProducto = verProducto;
window.agregarAlCarritoRapido = agregarAlCarritoRapido;