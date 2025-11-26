// js/cliente/mis-ordenes.js

const API_URL = 'https://indumanage-production.up.railway.app/api';
let ordenes = [];
let ordenSeleccionada = null;
let modalDetalle;

document.addEventListener('DOMContentLoaded', function() {
    verificarAutenticacion();
    
    modalDetalle = new bootstrap.Modal(document.getElementById('modalDetalle'));
    
    // Event Listeners
    document.getElementById('logoutBtn').addEventListener('click', cerrarSesion);
    document.getElementById('sidebarToggle')?.addEventListener('click', toggleSidebar);
    document.getElementById('buscarOrden').addEventListener('input', filtrarOrdenes);
    document.getElementById('filtroEstado').addEventListener('change', filtrarOrdenes);
    document.getElementById('filtroTipo').addEventListener('change', filtrarOrdenes);
    document.getElementById('btnLimpiarFiltros').addEventListener('click', limpiarFiltros);
    document.getElementById('btnCancelarOrden').addEventListener('click', cancelarOrden);
    
    // Actualizar contador del carrito
    actualizarContadorCarrito();
    
    // Cargar órdenes
    cargarOrdenes();
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

function actualizarContadorCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    document.getElementById('carritoCount').textContent = carrito.length;
}

async function cargarOrdenes() {
    try {
        const token = localStorage.getItem('token');
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        
        const response = await fetch(`${API_URL}/cliente/ordenes/mis-ordenes?clienteId=${usuario.id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            ordenes = await response.json();
            mostrarOrdenes(ordenes);
            actualizarEstadisticas();
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar las órdenes');
    }
}

function mostrarOrdenes(listaOrdenes) {
    const container = document.getElementById('listaOrdenes');
    const emptyState = document.getElementById('emptyState');
    
    if (listaOrdenes.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('d-none');
        return;
    }
    
    emptyState.classList.add('d-none');
    
    container.innerHTML = listaOrdenes.map(orden => `
        <div class="orden-card estado-${orden.estado}">
            <div class="orden-header">
                <div class="orden-numero">
                    <i class="bi bi-receipt me-2"></i>${orden.numeroOrden}
                </div>
                <span class="orden-badge badge-${orden.estado}">
                    ${formatearEstado(orden.estado)}
                </span>
            </div>
            
            <div class="orden-info">
                <div class="orden-info-item">
                    <label>Tipo de Orden</label>
                    <span>${formatearTipo(orden.tipoOrden)}</span>
                </div>
                <div class="orden-info-item">
                    <label>Fecha</label>
                    <span>${formatearFecha(orden.fechaCreacion)}</span>
                </div>
                <div class="orden-info-item">
                    <label>Productos</label>
                    <span>${orden.items.length} item(s)</span>
                </div>
                <div class="orden-info-item">
                    <label>Total</label>
                    <span class="orden-total">$${orden.total?.toFixed(2)}</span>
                </div>
            </div>
            
            <div class="orden-footer">
                <button class="btn-ver-detalle" onclick="verDetalle('${orden.id}')">
                    <i class="bi bi-eye me-1"></i>Ver Detalle
                </button>
            </div>
        </div>
    `).join('');
}

function verDetalle(ordenId) {
    ordenSeleccionada = ordenes.find(o => o.id === ordenId);
    if (!ordenSeleccionada) return;
    
    // Información básica
    document.getElementById('detNumero').textContent = ordenSeleccionada.numeroOrden;
    document.getElementById('detTipo').innerHTML = `<span class="badge bg-info">${formatearTipo(ordenSeleccionada.tipoOrden)}</span>`;
    document.getElementById('detEstado').innerHTML = `<span class="orden-badge badge-${ordenSeleccionada.estado}">${formatearEstado(ordenSeleccionada.estado)}</span>`;
    document.getElementById('detFechaCreacion').textContent = formatearFechaCompleta(ordenSeleccionada.fechaCreacion);
    
    // Método de entrega
    document.getElementById('detMetodo').textContent = ordenSeleccionada.metodoEntrega === 'RETIRO_LOCAL' ? 'Retiro en Local' : 'Envío a Domicilio';
    
    if (ordenSeleccionada.direccionEntrega) {
        document.getElementById('detDireccionDiv').style.display = 'block';
        document.getElementById('detDireccion').textContent = ordenSeleccionada.direccionEntrega;
    } else {
        document.getElementById('detDireccionDiv').style.display = 'none';
    }
    
    // Items
    const tbodyItems = document.getElementById('detItems');
    tbodyItems.innerHTML = ordenSeleccionada.items.map(item => `
        <tr>
            <td>
                <strong>${item.productoNombre}</strong><br>
                <small class="text-muted">${item.productoCodigo}</small>
            </td>
            <td>
                <span class="badge ${item.tipoProducto === 'REPUESTO' ? 'bg-success' : 'bg-primary'}">
                    ${item.tipoProducto}
                </span>
            </td>
            <td>
                ${item.tipoProducto === 'REPUESTO' ? `
                    Cantidad: ${item.cantidad}<br>
                    Precio unitario: $${item.precioUnitario?.toFixed(2)}
                ` : `
                    ${formatearFecha(item.fechaInicio)} al ${formatearFecha(item.fechaFin)}<br>
                    ${item.diasAlquiler} día(s) × $${item.precioDiario?.toFixed(2)}
                `}
            </td>
            <td class="text-end">
                <strong>$${item.total?.toFixed(2)}</strong>
            </td>
        </tr>
    `).join('');
    
    // Totales
    document.getElementById('detSubtotal').textContent = `$${ordenSeleccionada.subtotal?.toFixed(2)}`;
    document.getElementById('detIVA').textContent = `$${ordenSeleccionada.impuestos?.toFixed(2)}`;
    document.getElementById('detTotal').textContent = `$${ordenSeleccionada.total?.toFixed(2)}`;
    
    // Observaciones
    if (ordenSeleccionada.observacionesCliente) {
        document.getElementById('detObservacionesDiv').style.display = 'block';
        document.getElementById('detObservaciones').textContent = ordenSeleccionada.observacionesCliente;
    } else {
        document.getElementById('detObservacionesDiv').style.display = 'none';
    }
    
    // Respuesta admin
    if (ordenSeleccionada.observacionesAdmin) {
        document.getElementById('detRespuestaDiv').style.display = 'block';
        document.getElementById('detRespuesta').textContent = ordenSeleccionada.observacionesAdmin;
    } else {
        document.getElementById('detRespuestaDiv').style.display = 'none';
    }
    
    // Motivo rechazo
    if (ordenSeleccionada.motivoRechazo) {
        document.getElementById('detRechazoDiv').style.display = 'block';
        document.getElementById('detRechazo').textContent = ordenSeleccionada.motivoRechazo;
    } else {
        document.getElementById('detRechazoDiv').style.display = 'none';
    }
    
    // Botón cancelar (solo si está PENDIENTE)
    const btnCancelar = document.getElementById('btnCancelarOrden');
    if (ordenSeleccionada.estado === 'PENDIENTE') {
        btnCancelar.style.display = 'inline-block';
    } else {
        btnCancelar.style.display = 'none';
    }
    
    modalDetalle.show();
}

async function cancelarOrden() {
    if (!ordenSeleccionada) return;
    
    if (!confirm('¿Estás seguro de cancelar esta orden?')) return;
    
    try {
        const token = localStorage.getItem('token');
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        
        const response = await fetch(`${API_URL}/cliente/ordenes/${ordenSeleccionada.id}/cancelar?clienteId=${usuario.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            alert('Orden cancelada exitosamente');
            modalDetalle.hide();
            cargarOrdenes();
        } else {
            const error = await response.json();
            alert('Error: ' + (error.message || 'No se pudo cancelar la orden'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cancelar la orden');
    }
}

function actualizarEstadisticas() {
    document.getElementById('statPendientes').textContent = ordenes.filter(o => o.estado === 'PENDIENTE' || o.estado === 'EN_REVISION').length;
    document.getElementById('statAprobadas').textContent = ordenes.filter(o => o.estado === 'APROBADA').length;
    document.getElementById('statProceso').textContent = ordenes.filter(o => o.estado === 'EN_PROCESO').length;
    document.getElementById('statCompletadas').textContent = ordenes.filter(o => o.estado === 'COMPLETADA').length;
}

function filtrarOrdenes() {
    const buscar = document.getElementById('buscarOrden').value.toLowerCase();
    const estado = document.getElementById('filtroEstado').value;
    const tipo = document.getElementById('filtroTipo').value;
    
    const filtradas = ordenes.filter(orden => {
        const matchBuscar = !buscar || orden.numeroOrden.toLowerCase().includes(buscar);
        const matchEstado = !estado || orden.estado === estado;
        const matchTipo = !tipo || orden.tipoOrden === tipo;
        return matchBuscar && matchEstado && matchTipo;
    });
    
    mostrarOrdenes(filtradas);
}

function limpiarFiltros() {
    document.getElementById('buscarOrden').value = '';
    document.getElementById('filtroEstado').value = '';
    document.getElementById('filtroTipo').value = '';
    mostrarOrdenes(ordenes);
}

function formatearEstado(estado) {
    const estados = {
        'PENDIENTE': 'Pendiente',
        'EN_REVISION': 'En Revisión',
        'APROBADA': 'Aprobada',
        'RECHAZADA': 'Rechazada',
        'EN_PROCESO': 'En Proceso',
        'COMPLETADA': 'Completada',
        'CANCELADA': 'Cancelada'
    };
    return estados[estado] || estado;
}

function formatearTipo(tipo) {
    const tipos = {
        'VENTA': 'Venta',
        'ALQUILER': 'Alquiler',
        'MIXTA': 'Mixta'
    };
    return tipos[tipo] || tipo;
}

function formatearFecha(fecha) {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatearFechaCompleta(fecha) {
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

function cerrarSesion() {
    localStorage.clear();
    window.location.href = '/index.html';
}