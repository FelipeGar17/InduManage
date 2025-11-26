package com.indumanage.indumanage.service;

import com.indumanage.indumanage.model.*;
import com.indumanage.indumanage.repository.OrdenRepository;
import com.indumanage.indumanage.repository.ProductoRepository;
import com.indumanage.indumanage.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.Year;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrdenService {
    
    private final OrdenRepository ordenRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;
    
    /**
     * Crear una nueva orden
     */
    @Transactional
    public Orden crear(Orden orden, String clienteId) {
        // Obtener información del cliente
        Usuario cliente = usuarioRepository.findById(clienteId)
            .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
        
        orden.setClienteId(cliente.getId());
        orden.setClienteNombre(cliente.getNombre() + " " + cliente.getApellido());
        orden.setClienteCorreo(cliente.getCorreo());
        orden.setClienteTelefono(cliente.getTelefono());
        
        // Generar número de orden único
        orden.setNumeroOrden(generarNumeroOrden());
        
        // Calcular totales y validar stock
        calcularTotales(orden);
        
        // Establecer estado inicial
        orden.setEstado(EstadoOrden.PENDIENTE);
        orden.setFechaCreacion(LocalDateTime.now());
        orden.setFechaActualizacion(LocalDateTime.now());
        
        // Determinar tipo de orden
        orden.setTipoOrden(determinarTipoOrden(orden));
        
        return ordenRepository.save(orden);
    }
    
    /**
     * Buscar orden por ID
     */
    public Optional<Orden> buscarPorId(String id) {
        return ordenRepository.findById(id);
    }
    
    /**
     * Listar todas las órdenes
     */
    public List<Orden> listarTodas() {
        return ordenRepository.findAllByOrderByFechaCreacionDesc();
    }
    
    /**
     * Listar órdenes por cliente
     */
    public List<Orden> listarPorCliente(String clienteId) {
        return ordenRepository.findByClienteIdOrderByFechaCreacionDesc(clienteId);
    }
    
    /**
     * Listar órdenes por estado
     */
    public List<Orden> listarPorEstado(EstadoOrden estado) {
        return ordenRepository.findByEstado(estado);
    }
    
    /**
     * Aprobar orden
     */
    @Transactional
    public Orden aprobar(String ordenId, String observacionesAdmin) {
        Orden orden = ordenRepository.findById(ordenId)
            .orElseThrow(() -> new RuntimeException("Orden no encontrada"));
        
        if (orden.getEstado() != EstadoOrden.PENDIENTE && orden.getEstado() != EstadoOrden.EN_REVISION) {
            throw new RuntimeException("Solo se pueden aprobar órdenes en estado PENDIENTE o EN_REVISION");
        }
        
        // Validar disponibilidad de productos antes de aprobar
        validarDisponibilidadProductos(orden);
        
        // Actualizar stock si es venta de repuestos
        actualizarStockRepuestos(orden);
        
        orden.setEstado(EstadoOrden.APROBADA);
        orden.setObservacionesAdmin(observacionesAdmin);
        orden.setFechaAprobacion(LocalDateTime.now());
        orden.setFechaActualizacion(LocalDateTime.now());
        
        return ordenRepository.save(orden);
    }
    
    /**
     * Rechazar orden
     */
    @Transactional
    public Orden rechazar(String ordenId, String motivoRechazo, String observacionesAdmin) {
        Orden orden = ordenRepository.findById(ordenId)
            .orElseThrow(() -> new RuntimeException("Orden no encontrada"));
        
        if (orden.getEstado() == EstadoOrden.COMPLETADA || orden.getEstado() == EstadoOrden.CANCELADA) {
            throw new RuntimeException("No se puede rechazar una orden completada o cancelada");
        }
        
        orden.setEstado(EstadoOrden.RECHAZADA);
        orden.setMotivoRechazo(motivoRechazo);
        orden.setObservacionesAdmin(observacionesAdmin);
        orden.setFechaActualizacion(LocalDateTime.now());
        
        return ordenRepository.save(orden);
    }
    
    /**
     * Cancelar orden (solo cliente y solo si está PENDIENTE)
     */
    @Transactional
    public Orden cancelar(String ordenId, String clienteId) {
        Orden orden = ordenRepository.findById(ordenId)
            .orElseThrow(() -> new RuntimeException("Orden no encontrada"));
        
        // Verificar que sea del cliente
        if (!orden.getClienteId().equals(clienteId)) {
            throw new RuntimeException("No tiene permisos para cancelar esta orden");
        }
        
        // Solo se puede cancelar si está pendiente
        if (orden.getEstado() != EstadoOrden.PENDIENTE) {
            throw new RuntimeException("Solo se pueden cancelar órdenes en estado PENDIENTE");
        }
        
        orden.setEstado(EstadoOrden.CANCELADA);
        orden.setFechaActualizacion(LocalDateTime.now());
        
        return ordenRepository.save(orden);
    }
    
    /**
     * Cambiar estado de orden
     */
    @Transactional
    public Orden cambiarEstado(String ordenId, EstadoOrden nuevoEstado, String observaciones) {
        Orden orden = ordenRepository.findById(ordenId)
            .orElseThrow(() -> new RuntimeException("Orden no encontrada"));
        
        orden.setEstado(nuevoEstado);
        
        if (observaciones != null && !observaciones.isEmpty()) {
            String obs = orden.getObservacionesAdmin() != null ? orden.getObservacionesAdmin() : "";
            orden.setObservacionesAdmin(obs + "\n" + observaciones);
        }
        
        if (nuevoEstado == EstadoOrden.COMPLETADA) {
            orden.setFechaCompletado(LocalDateTime.now());
        }
        
        orden.setFechaActualizacion(LocalDateTime.now());
        
        return ordenRepository.save(orden);
    }
    
    /**
     * Actualizar orden
     */
    @Transactional
    public Orden actualizar(Orden orden) {
        orden.setFechaActualizacion(LocalDateTime.now());
        return ordenRepository.save(orden);
    }
    
    /**
     * Contar órdenes por estado
     */
    public Long contarPorEstado(EstadoOrden estado) {
        return ordenRepository.countByEstado(estado);
    }
    
    // ========== MÉTODOS PRIVADOS DE APOYO ==========
    
    /**
     * Generar número de orden único
     */
    private String generarNumeroOrden() {
        String year = String.valueOf(Year.now().getValue());
        long count = ordenRepository.count() + 1;
        return String.format("ORD-%s-%05d", year, count);
    }
    
    /**
     * Calcular totales de la orden
     */
    private void calcularTotales(Orden orden) {
        double subtotal = 0.0;
        
        for (ItemOrden item : orden.getItems()) {
            // Validar que el producto existe
            Producto producto = productoRepository.findById(item.getProductoId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + item.getProductoId()));
            
            if (producto.getTipo() == TipoProducto.REPUESTO) {
                // Validar stock disponible
                if (producto.getStock() == null || producto.getStock() < item.getCantidad()) {
                    throw new RuntimeException("Stock insuficiente para: " + producto.getNombre());
                }
                
                // Calcular subtotal para repuesto
                item.setPrecioUnitario(producto.getPrecio());
                item.setSubtotal(item.getCantidad() * item.getPrecioUnitario());
                item.setTotal(item.getSubtotal());
                
            } else if (producto.getTipo() == TipoProducto.MAQUINARIA) {
                // Validar fechas
                if (item.getFechaInicio() == null || item.getFechaFin() == null) {
                    throw new RuntimeException("Fechas de alquiler obligatorias para: " + producto.getNombre());
                }
                
                if (item.getFechaInicio().isAfter(item.getFechaFin())) {
                    throw new RuntimeException("Fecha de inicio debe ser anterior a fecha fin");
                }
                
                // Calcular días de alquiler
                long dias = ChronoUnit.DAYS.between(item.getFechaInicio(), item.getFechaFin()) + 1;
                item.setDiasAlquiler((int) dias);
                
                // Usar precio por día
                item.setPrecioDiario(producto.getPrecioAlquilerDia());
                item.setTotalAlquiler(dias * item.getPrecioDiario());
                item.setTotal(item.getTotalAlquiler());
            }
            
            subtotal += item.getTotal();
        }
        
        orden.setSubtotal(subtotal);
        // IVA del 19% (puedes ajustar según tu país)
        orden.setImpuestos(subtotal * 0.19);
        orden.setTotal(subtotal + orden.getImpuestos());
    }
    
    /**
     * Determinar tipo de orden según los items
     */
    private TipoOrden determinarTipoOrden(Orden orden) {
        boolean tieneRepuestos = false;
        boolean tieneMaquinaria = false;
        
        for (ItemOrden item : orden.getItems()) {
            if (item.getTipoProducto() == TipoProducto.REPUESTO) {
                tieneRepuestos = true;
            } else if (item.getTipoProducto() == TipoProducto.MAQUINARIA) {
                tieneMaquinaria = true;
            }
        }
        
        if (tieneRepuestos && tieneMaquinaria) {
            return TipoOrden.MIXTA;
        } else if (tieneMaquinaria) {
            return TipoOrden.ALQUILER;
        } else {
            return TipoOrden.VENTA;
        }
    }
    
    /**
     * Validar disponibilidad de productos
     */
    private void validarDisponibilidadProductos(Orden orden) {
        for (ItemOrden item : orden.getItems()) {
            Producto producto = productoRepository.findById(item.getProductoId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + item.getProductoId()));
            
            if (!producto.isActivo() || (producto.getDisponibleVenta() != null && !producto.getDisponibleVenta())) {
                throw new RuntimeException("Producto no disponible: " + producto.getNombre());
            }
            
            if (producto.getTipo() == TipoProducto.REPUESTO) {
                if (producto.getStock() < item.getCantidad()) {
                    throw new RuntimeException("Stock insuficiente para: " + producto.getNombre());
                }
            }
        }
    }
    
    /**
     * Actualizar stock de repuestos al aprobar orden
     */
    private void actualizarStockRepuestos(Orden orden) {
        for (ItemOrden item : orden.getItems()) {
            if (item.getTipoProducto() == TipoProducto.REPUESTO) {
                Producto producto = productoRepository.findById(item.getProductoId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
                
                int nuevoStock = producto.getStock() - item.getCantidad();
                producto.setStock(nuevoStock);
                producto.setFechaActualizacion(LocalDateTime.now());
                
                productoRepository.save(producto);
            }
        }
    }
}
