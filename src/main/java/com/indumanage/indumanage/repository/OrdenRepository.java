package com.indumanage.indumanage.repository;

import com.indumanage.indumanage.model.EstadoOrden;
import com.indumanage.indumanage.model.Orden;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrdenRepository extends MongoRepository<Orden, String> {
    
    List<Orden> findByClienteId(String clienteId);
    
    List<Orden> findByEstado(EstadoOrden estado);
    
    List<Orden> findByClienteIdOrderByFechaCreacionDesc(String clienteId);
    
    List<Orden> findAllByOrderByFechaCreacionDesc();
    
    Optional<Orden> findByNumeroOrden(String numeroOrden);
    
    Long countByEstado(EstadoOrden estado);
}
