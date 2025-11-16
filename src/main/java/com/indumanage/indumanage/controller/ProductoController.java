package com.indumanage.indumanage.controller;

import com.indumanage.indumanage.dto.ProductoDTO;
import com.indumanage.indumanage.model.*;
import com.indumanage.indumanage.service.ProductoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/productos")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ProductoController {
    
    private final ProductoService productoService;
    
    @GetMapping
    public ResponseEntity<List<ProductoDTO>> listarTodos() {
        List<ProductoDTO> productos = productoService.listarTodos().stream()
            .map(this::convertirADTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(productos);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ProductoDTO> obtenerPorId(@PathVariable String id) {
        return productoService.buscarPorId(id)
            .map(producto -> ResponseEntity.ok(convertirADTO(producto)))
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/buscar")
    public ResponseEntity<List<String>> buscarNombres(@RequestParam String q) {
        List<String> nombres = productoService.buscarPorNombre(q).stream()
            .map(Producto::getNombre)
            .distinct()
            .limit(10)
            .collect(Collectors.toList());
        return ResponseEntity.ok(nombres);
    }
    
    @GetMapping("/categorias")
    public ResponseEntity<List<String>> obtenerCategorias() {
        List<String> categorias = productoService.listarActivos().stream()
            .map(Producto::getCategoria)
            .filter(cat -> cat != null && !cat.isEmpty())
            .distinct()
            .sorted()
            .collect(Collectors.toList());
        return ResponseEntity.ok(categorias);
    }
    
    @GetMapping("/ubicaciones")
    public ResponseEntity<List<String>> obtenerUbicaciones() {
        List<String> ubicaciones = productoService.listarActivos().stream()
            .map(Producto::getUbicacion)
            .filter(ub -> ub != null && !ub.isEmpty())
            .distinct()
            .sorted()
            .collect(Collectors.toList());
        return ResponseEntity.ok(ubicaciones);
    }
    
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody ProductoDTO productoDTO) {
        try {
            // Validar código único
            if (productoService.buscarPorCodigo(productoDTO.getCodigo()).isPresent()) {
                return ResponseEntity.badRequest().body("El código ya existe");
            }
            
            Producto producto = convertirAProducto(productoDTO);
            Producto productoGuardado = productoService.crear(producto);
            return ResponseEntity.ok(convertirADTO(productoGuardado));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable String id, @RequestBody ProductoDTO productoDTO) {
        try {
            return productoService.buscarPorId(id)
                .map(producto -> {
                    // Validar código único si cambió
                    if (!producto.getCodigo().equals(productoDTO.getCodigo()) &&
                        productoService.buscarPorCodigo(productoDTO.getCodigo()).isPresent()) {
                        return ResponseEntity.badRequest().body("El código ya existe");
                    }
                    
                    // Actualizar campos
                    producto.setCodigo(productoDTO.getCodigo());
                    producto.setTipo(TipoProducto.valueOf(productoDTO.getTipo()));
                    
                    if (productoDTO.getTipoMaquinaria() != null && !productoDTO.getTipoMaquinaria().isEmpty()) {
                        producto.setTipoMaquinaria(TipoMaquinaria.valueOf(productoDTO.getTipoMaquinaria()));
                    } else {
                        producto.setTipoMaquinaria(null);
                    }
                    
                    producto.setNombre(productoDTO.getNombre());
                    producto.setDescripcion(productoDTO.getDescripcion());
                    producto.setCategoria(productoDTO.getCategoria());
                    producto.setUbicacion(productoDTO.getUbicacion());
                    
                    if (productoDTO.getEstado() != null && !productoDTO.getEstado().isEmpty()) {
                        producto.setEstado(EstadoMaquinaria.valueOf(productoDTO.getEstado()));
                    } else {
                        producto.setEstado(null);
                    }
                    
                    producto.setStock(productoDTO.getStock());
                    producto.setFechaAdquisicion(productoDTO.getFechaAdquisicion());
                    producto.setObservaciones(productoDTO.getObservaciones());
                    
                    if (productoDTO.getActivo() != null) {
                        producto.setActivo(productoDTO.getActivo());
                    }
                    
                    Producto productoActualizado = productoService.actualizar(producto);
                    return ResponseEntity.ok(convertirADTO(productoActualizado));
                })
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable String id) {
        try {
            productoService.eliminar(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
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
        dto.setFechaAdquisicion(producto.getFechaAdquisicion());
        dto.setObservaciones(producto.getObservaciones());
        dto.setActivo(producto.isActivo());
        dto.setFechaCreacion(producto.getFechaCreacion());
        dto.setFechaActualizacion(producto.getFechaActualizacion());
        return dto;
    }
    
    private Producto convertirAProducto(ProductoDTO dto) {
        Producto producto = new Producto();
        producto.setCodigo(dto.getCodigo());
        producto.setTipo(TipoProducto.valueOf(dto.getTipo()));
        
        if (dto.getTipoMaquinaria() != null && !dto.getTipoMaquinaria().isEmpty()) {
            producto.setTipoMaquinaria(TipoMaquinaria.valueOf(dto.getTipoMaquinaria()));
        }
        
        producto.setNombre(dto.getNombre());
        producto.setDescripcion(dto.getDescripcion());
        producto.setCategoria(dto.getCategoria());
        producto.setUbicacion(dto.getUbicacion());
        
        if (dto.getEstado() != null && !dto.getEstado().isEmpty()) {
            producto.setEstado(EstadoMaquinaria.valueOf(dto.getEstado()));
        }
        
        producto.setStock(dto.getStock());
        producto.setFechaAdquisicion(dto.getFechaAdquisicion());
        producto.setObservaciones(dto.getObservaciones());
        
        return producto;
    }
}
