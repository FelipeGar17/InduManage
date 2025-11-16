package com.indumanage.indumanage.repository;

import com.indumanage.indumanage.model.Ticket;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends MongoRepository<Ticket, String> {
    
    List<Ticket> findByOperarioId(String operarioId);
    
    List<Ticket> findByEstado(String estado);
    
    List<Ticket> findByProductoId(String productoId);
}
