package com.indumanage.indumanage.controller;

import com.indumanage.indumanage.dto.*;
import com.indumanage.indumanage.model.*;
import com.indumanage.indumanage.service.OrdenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/ordenes")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrdenController {
    
    private final OrdenService ordenService;
    
    /**
     * Listar todas las órdenes
     */
    @GetMapping
    public ResponseEntity<List<OrdenDTO>> listarTodas() {
        List<OrdenDTO> ordenes = ordenService.listarTodas().stream()
            .map(this::convertirADTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(ordenes);
    }
    
    /**
     * Obtener orden por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<OrdenDTO> obtenerPorId(@PathVariable String id) {
        return ordenService.buscarPorId(id)
            .map(orden -> ResponseEntity.ok(convertirADTO(orden)))
            .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Listar órdenes por estado
     */
    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<OrdenDTO>> listarPorEstado(@PathVariable String estado) {
        try {
            EstadoOrden estadoOrden = EstadoOrden.valueOf(estado.toUpperCase());
            List<OrdenDTO> ordenes = ordenService.listarPorEstado(estadoOrden).stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
            return ResponseEntity.ok(ordenes);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Aprobar orden
     */
    @PutMapping("/{id}/aprobar")
    public ResponseEntity<?> aprobar(
            @PathVariable String id,
            @RequestBody AprobarOrdenRequest request) {
        try {
            Orden orden = ordenService.aprobar(id, request.getObservacionesAdmin());
            return ResponseEntity.ok(convertirADTO(orden));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error al aprobar orden: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    /**
     * Rechazar orden
     */
    @PutMapping("/{id}/rechazar")
    public ResponseEntity<?> rechazar(
            @PathVariable String id,
            @Valid @RequestBody RechazarOrdenRequest request) {
        try {
            Orden orden = ordenService.rechazar(
                id,
                request.getMotivoRechazo(),
                request.getObservacionesAdmin()
            );
            return ResponseEntity.ok(convertirADTO(orden));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error al rechazar orden: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    /**
     * Cambiar estado de orden
     */
    @PutMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(
            @PathVariable String id,
            @Valid @RequestBody CambiarEstadoOrdenRequest request) {
        try {
            EstadoOrden nuevoEstado = EstadoOrden.valueOf(request.getEstado().toUpperCase());
            Orden orden = ordenService.cambiarEstado(id, nuevoEstado, request.getObservaciones());
            return ResponseEntity.ok(convertirADTO(orden));
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Estado inválido: " + request.getEstado());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error al cambiar estado: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    /**
     * Obtener estadísticas de órdenes
     */
    @GetMapping("/estadisticas")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticas() {
        Map<String, Object> estadisticas = new HashMap<>();
        
        estadisticas.put("pendientes", ordenService.contarPorEstado(EstadoOrden.PENDIENTE));
        estadisticas.put("enRevision", ordenService.contarPorEstado(EstadoOrden.EN_REVISION));
        estadisticas.put("aprobadas", ordenService.contarPorEstado(EstadoOrden.APROBADA));
        estadisticas.put("enProceso", ordenService.contarPorEstado(EstadoOrden.EN_PROCESO));
        estadisticas.put("completadas", ordenService.contarPorEstado(EstadoOrden.COMPLETADA));
        estadisticas.put("rechazadas", ordenService.contarPorEstado(EstadoOrden.RECHAZADA));
        estadisticas.put("canceladas", ordenService.contarPorEstado(EstadoOrden.CANCELADA));
        
        return ResponseEntity.ok(estadisticas);
    }
    
    /**
     * Actualizar observaciones de admin en una orden
     */
    @PutMapping("/{id}/observaciones")
    public ResponseEntity<?> actualizarObservaciones(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        try {
            return ordenService.buscarPorId(id)
                .map(orden -> {
                    String observaciones = body.get("observaciones");
                    orden.setObservacionesAdmin(observaciones);
                    Orden ordenActualizada = ordenService.actualizar(orden);
                    return ResponseEntity.ok(convertirADTO(ordenActualizada));
                })
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error al actualizar observaciones: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    // ========== MÉTODOS DE CONVERSIÓN ==========
    
    private OrdenDTO convertirADTO(Orden orden) {
        OrdenDTO dto = new OrdenDTO();
        dto.setId(orden.getId());
        dto.setClienteId(orden.getClienteId());
        dto.setClienteNombre(orden.getClienteNombre());
        dto.setClienteCorreo(orden.getClienteCorreo());
        dto.setClienteTelefono(orden.getClienteTelefono());
        dto.setNumeroOrden(orden.getNumeroOrden());
        dto.setTipoOrden(orden.getTipoOrden().name());
        dto.setEstado(orden.getEstado().name());
        
        // Convertir items
        List<ItemOrdenDTO> itemsDTO = orden.getItems().stream()
            .map(this::convertirItemADTO)
            .collect(Collectors.toList());
        dto.setItems(itemsDTO);
        
        dto.setSubtotal(orden.getSubtotal());
        dto.setImpuestos(orden.getImpuestos());
        dto.setTotal(orden.getTotal());
        dto.setObservacionesCliente(orden.getObservacionesCliente());
        dto.setObservacionesAdmin(orden.getObservacionesAdmin());
        dto.setMotivoRechazo(orden.getMotivoRechazo());
        dto.setFechaCreacion(orden.getFechaCreacion());
        dto.setFechaActualizacion(orden.getFechaActualizacion());
        dto.setFechaAprobacion(orden.getFechaAprobacion());
        dto.setFechaCompletado(orden.getFechaCompletado());
        dto.setDireccionEntrega(orden.getDireccionEntrega());
        dto.setMetodoEntrega(orden.getMetodoEntrega());
        
        return dto;
    }
    
    private ItemOrdenDTO convertirItemADTO(ItemOrden item) {
        ItemOrdenDTO dto = new ItemOrdenDTO();
        dto.setProductoId(item.getProductoId());
        dto.setProductoCodigo(item.getProductoCodigo());
        dto.setProductoNombre(item.getProductoNombre());
        dto.setTipoProducto(item.getTipoProducto().name());
        dto.setCantidad(item.getCantidad());
        dto.setPrecioUnitario(item.getPrecioUnitario());
        dto.setSubtotal(item.getSubtotal());
        dto.setFechaInicio(item.getFechaInicio());
        dto.setFechaFin(item.getFechaFin());
        dto.setDiasAlquiler(item.getDiasAlquiler());
        dto.setPrecioDiario(item.getPrecioDiario());
        dto.setTotalAlquiler(item.getTotalAlquiler());
        dto.setTotal(item.getTotal());
        return dto;
    }
}