package com.indumanage.indumanage.service;

import com.indumanage.indumanage.model.Producto;
import com.indumanage.indumanage.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductoService {
    
    private final ProductoRepository productoRepository;
    
    public Producto crear(Producto producto) {
        // Validar que el código no exista
        if (productoRepository.existsByCodigo(producto.getCodigo())) {
            throw new RuntimeException("El código ya existe");
        }
        
        // Establecer fechas
        producto.setFechaCreacion(LocalDateTime.now());
        producto.setFechaActualizacion(LocalDateTime.now());
        producto.setActivo(true);
        
        return productoRepository.save(producto);
    }
    
    public Optional<Producto> buscarPorId(String id) {
        return productoRepository.findById(id);
    }
    
    public Optional<Producto> buscarPorCodigo(String codigo) {
        return productoRepository.findByCodigo(codigo);
    }
    
    public List<Producto> listarTodos() {
        return productoRepository.findAll();
    }
    
    public List<Producto> listarActivos() {
        return productoRepository.findByActivoTrue();
    }
    
    public List<Producto> buscarPorNombre(String nombre) {
        return productoRepository.findByNombreContainingIgnoreCase(nombre);
    }
    
    public List<Producto> buscarPorCategoria(String categoria) {
        return productoRepository.findByCategoriaContainingIgnoreCase(categoria);
    }
    
    public List<Producto> buscarPorUbicacion(String ubicacion) {
        return productoRepository.findByUbicacionContainingIgnoreCase(ubicacion);
    }
    
    public Producto actualizar(Producto producto) {
        producto.setFechaActualizacion(LocalDateTime.now());
        return productoRepository.save(producto);
    }
    
    public void eliminar(String id) {
        // Soft delete
        productoRepository.findById(id).ifPresent(producto -> {
            producto.setActivo(false);
            producto.setFechaActualizacion(LocalDateTime.now());
            productoRepository.save(producto);
        });
    }
}
