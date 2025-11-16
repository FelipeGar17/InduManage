package com.indumanage.indumanage.repository;

import com.indumanage.indumanage.model.Producto;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductoRepository extends MongoRepository<Producto, String> {
    
    Optional<Producto> findByCodigo(String codigo);
    
    boolean existsByCodigo(String codigo);
    
    List<Producto> findByNombreContainingIgnoreCase(String nombre);
    
    List<Producto> findByCategoriaContainingIgnoreCase(String categoria);
    
    List<Producto> findByUbicacionContainingIgnoreCase(String ubicacion);
    
    List<Producto> findByActivoTrue();
}
