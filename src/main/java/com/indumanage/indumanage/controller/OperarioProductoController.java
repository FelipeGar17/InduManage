package com.indumanage.indumanage.controller;

import com.indumanage.indumanage.dto.ProductoDTO;
import com.indumanage.indumanage.service.ProductoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/operario/productos")
@RequiredArgsConstructor
@PreAuthorize("hasRole('OPERARIO')")
public class OperarioProductoController {
    
    private final ProductoService productoService;
    
    @GetMapping
    public ResponseEntity<List<ProductoDTO>> listarActivos() {
        List<ProductoDTO> productos = productoService.listarActivos().stream()
            .map(producto -> {
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
                dto.setActivo(producto.isActivo());
                return dto;
            })
            .collect(Collectors.toList());
        return ResponseEntity.ok(productos);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ProductoDTO> obtenerPorId(@PathVariable String id) {
        return productoService.buscarPorId(id)
            .map(producto -> {
                ProductoDTO dto = new ProductoDTO();
                dto.setId(producto.getId());
                dto.setCodigo(producto.getCodigo());
                dto.setNombre(producto.getNombre());
                dto.setDescripcion(producto.getDescripcion());
                return ResponseEntity.ok(dto);
            })
            .orElse(ResponseEntity.notFound().build());
    }
}
