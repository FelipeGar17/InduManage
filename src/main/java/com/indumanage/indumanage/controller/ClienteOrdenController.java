package com.indumanage.indumanage.controller;

import com.indumanage.indumanage.dto.*;
import com.indumanage.indumanage.model.*;
import com.indumanage.indumanage.service.OrdenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cliente/ordenes")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CLIENTE')")
public class ClienteOrdenController {
    
    private final OrdenService ordenService;
    
    /**
     * Crear nueva orden
     */
    @PostMapping
    public ResponseEntity<?> crearOrden(
            @Valid @RequestBody CrearOrdenRequest request,
            @RequestParam String clienteId) {
        try {
            // Convertir request a Orden
            Orden orden = new Orden();
            orden.setObservacionesCliente(request.getObservacionesCliente());
            orden.setDireccionEntrega(request.getDireccionEntrega());
            orden.setMetodoEntrega(request.getMetodoEntrega());
            
            // Convertir items
            List<ItemOrden> items = request.getItems().stream()
                .map(this::convertirAItemOrden)
                .collect(Collectors.toList());
            orden.setItems(items);
            
            // Crear orden
            Orden ordenCreada = ordenService.crear(orden, clienteId);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(convertirADTO(ordenCreada));
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error al crear orden: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    /**
     * Listar mis órdenes
     */
    @GetMapping("/mis-ordenes")
    public ResponseEntity<List<OrdenDTO>> listarMisOrdenes(@RequestParam String clienteId) {
        List<OrdenDTO> ordenes = ordenService.listarPorCliente(clienteId).stream()
            .map(this::convertirADTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(ordenes);
    }
    
    /**
     * Obtener orden por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerOrden(@PathVariable String id, @RequestParam String clienteId) {
        return ordenService.buscarPorId(id)
            .map(orden -> {
                // Verificar que la orden pertenece al cliente
                if (!orden.getClienteId().equals(clienteId)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "No tiene permisos para ver esta orden"));
                }
                return ResponseEntity.ok(convertirADTO(orden));
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Cancelar orden (solo si está PENDIENTE)
     */
    @PutMapping("/{id}/cancelar")
    public ResponseEntity<?> cancelarOrden(@PathVariable String id, @RequestParam String clienteId) {
        try {
            Orden orden = ordenService.cancelar(id, clienteId);
            return ResponseEntity.ok(convertirADTO(orden));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
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
    
    private ItemOrden convertirAItemOrden(ItemOrdenDTO dto) {
        ItemOrden item = new ItemOrden();
        item.setProductoId(dto.getProductoId());
        item.setProductoCodigo(dto.getProductoCodigo());
        item.setProductoNombre(dto.getProductoNombre());
        item.setTipoProducto(TipoProducto.valueOf(dto.getTipoProducto()));
        item.setCantidad(dto.getCantidad());
        item.setFechaInicio(dto.getFechaInicio());
        item.setFechaFin(dto.getFechaFin());
        return item;
    }
}