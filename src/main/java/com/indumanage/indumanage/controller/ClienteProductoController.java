package com.indumanage.indumanage.controller;

import com.indumanage.indumanage.dto.ProductoDTO;
import com.indumanage.indumanage.model.Producto;
import com.indumanage.indumanage.model.TipoProducto;
import com.indumanage.indumanage.service.ProductoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cliente/productos")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CLIENTE')")
public class ClienteProductoController {
    
    private final ProductoService productoService;
    
    /**
     * Listar productos disponibles para venta/alquiler
     */
    @GetMapping
    public ResponseEntity<List<ProductoDTO>> listarDisponibles() {
        List<ProductoDTO> productos = productoService.listarActivos().stream()
            .filter(producto -> producto.getDisponibleVenta() == null || producto.getDisponibleVenta())
            .map(this::convertirADTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(productos);
    }
    
    /**
     * Obtener producto por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductoDTO> obtenerPorId(@PathVariable String id) {
        return productoService.buscarPorId(id)
            .filter(producto -> producto.isActivo() && (producto.getDisponibleVenta() == null || producto.getDisponibleVenta()))
            .map(producto -> ResponseEntity.ok(convertirADTO(producto)))
            .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Buscar productos por nombre
     */
    @GetMapping("/buscar")
    public ResponseEntity<List<ProductoDTO>> buscarPorNombre(@RequestParam String q) {
        List<ProductoDTO> productos = productoService.buscarPorNombre(q).stream()
            .filter(producto -> producto.isActivo() && (producto.getDisponibleVenta() == null || producto.getDisponibleVenta()))
            .map(this::convertirADTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(productos);
    }
    
    /**
     * Listar solo maquinaria disponible para alquiler
     */
    @GetMapping("/maquinaria")
    public ResponseEntity<List<ProductoDTO>> listarMaquinaria() {
        List<ProductoDTO> maquinaria = productoService.listarActivos().stream()
            .filter(producto -> producto.getTipo() == TipoProducto.MAQUINARIA)
            .filter(producto -> producto.getDisponibleVenta() == null || producto.getDisponibleVenta())
            .map(this::convertirADTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(maquinaria);
    }
    
    /**
     * Listar solo repuestos disponibles para venta
     */
    @GetMapping("/repuestos")
    public ResponseEntity<List<ProductoDTO>> listarRepuestos() {
        List<ProductoDTO> repuestos = productoService.listarActivos().stream()
            .filter(producto -> producto.getTipo() == TipoProducto.REPUESTO)
            .filter(producto -> producto.getStock() != null && producto.getStock() > 0)
            .filter(producto -> producto.getDisponibleVenta() == null || producto.getDisponibleVenta())
            .map(this::convertirADTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(repuestos);
    }
    
    /**
     * Listar productos por categoría
     */
    @GetMapping("/categoria/{categoria}")
    public ResponseEntity<List<ProductoDTO>> listarPorCategoria(@PathVariable String categoria) {
        List<ProductoDTO> productos = productoService.buscarPorCategoria(categoria).stream()
            .filter(producto -> producto.isActivo() && (producto.getDisponibleVenta() == null || producto.getDisponibleVenta()))
            .map(this::convertirADTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(productos);
    }
    
    /**
     * Obtener todas las categorías disponibles
     */
    @GetMapping("/categorias")
    public ResponseEntity<List<String>> obtenerCategorias() {
        List<String> categorias = productoService.listarActivos().stream()
            .filter(producto -> producto.getDisponibleVenta() == null || producto.getDisponibleVenta())
            .map(Producto::getCategoria)
            .filter(cat -> cat != null && !cat.isEmpty())
            .distinct()
            .sorted()
            .collect(Collectors.toList());
        return ResponseEntity.ok(categorias);
    }
    
    /**
     * Verificar disponibilidad de stock de un repuesto
     */
    @GetMapping("/{id}/stock")
    public ResponseEntity<Map<String, Object>> verificarStock(@PathVariable String id) {
        return productoService.buscarPorId(id)
            .map(producto -> {
                Map<String, Object> response = new HashMap<>();
                
                if (producto.getTipo() == TipoProducto.REPUESTO) {
                    response.put("disponible", producto.getStock() != null && producto.getStock() > 0);
                    response.put("stock", producto.getStock());
                    response.put("stockMinimo", producto.getStockMinimo());
                } else {
                    response.put("disponible", producto.isActivo() && (producto.getDisponibleVenta() == null || producto.getDisponibleVenta()));
                    response.put("tipo", "MAQUINARIA");
                }
                
                return ResponseEntity.ok(response);
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Obtener productos destacados o más populares
     * (Por ahora retorna los 10 primeros activos, puedes mejorar la lógica)
     */
    @GetMapping("/destacados")
    public ResponseEntity<List<ProductoDTO>> obtenerDestacados() {
        List<ProductoDTO> destacados = productoService.listarActivos().stream()
            .filter(producto -> producto.getDisponibleVenta() == null || producto.getDisponibleVenta())
            .limit(10)
            .map(this::convertirADTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(destacados);
    }
    
    /**
     * Filtrar productos por rango de precio
     */
    @GetMapping("/filtrar-precio")
    public ResponseEntity<List<ProductoDTO>> filtrarPorPrecio(
            @RequestParam(required = false) Double precioMin,
            @RequestParam(required = false) Double precioMax) {
        
        List<ProductoDTO> productos = productoService.listarActivos().stream()
            .filter(producto -> producto.isActivo() && (producto.getDisponibleVenta() == null || producto.getDisponibleVenta()))
            .filter(producto -> {
                if (producto.getPrecio() == null) return false;
                
                boolean cumplePrecioMin = precioMin == null || producto.getPrecio() >= precioMin;
                boolean cumplePrecioMax = precioMax == null || producto.getPrecio() <= precioMax;
                
                return cumplePrecioMin && cumplePrecioMax;
            })
            .map(this::convertirADTO)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(productos);
    }
    
    // ========== MÉTODO DE CONVERSIÓN ==========
    
    private ProductoDTO convertirADTO(Producto producto) {
        ProductoDTO dto = new ProductoDTO();
        dto.setId(producto.getId());
        dto.setCodigo(producto.getCodigo());
        dto.setTipo(producto.getTipo().name());
        dto.setTipoMaquinaria(producto.getTipoMaquinaria() != null ? producto.getTipoMaquinaria().name() : null);
        dto.setNombre(producto.getNombre());
        dto.setDescripcion(producto.getDescripcion());
        dto.setCategoria(producto.getCategoria());
        dto.setUbicacion(producto.getUbicacion());
        dto.setEstado(producto.getEstado() != null ? producto.getEstado().name() : null);
        dto.setStock(producto.getStock());
        
        // Información de precios
        dto.setPrecio(producto.getPrecio());
        dto.setPrecioAlquilerDia(producto.getPrecioAlquilerDia());
        dto.setPrecioAlquilerSemana(producto.getPrecioAlquilerSemana());
        dto.setPrecioAlquilerMes(producto.getPrecioAlquilerMes());
        dto.setStockMinimo(producto.getStockMinimo());
        dto.setImagenUrl(producto.getImagenUrl());
        dto.setDisponibleVenta(producto.getDisponibleVenta());
        
        dto.setFechaAdquisicion(producto.getFechaAdquisicion());
        dto.setObservaciones(producto.getObservaciones());
        dto.setActivo(producto.isActivo());
        dto.setFechaCreacion(producto.getFechaCreacion());
        dto.setFechaActualizacion(producto.getFechaActualizacion());
        
        return dto;
    }
}
