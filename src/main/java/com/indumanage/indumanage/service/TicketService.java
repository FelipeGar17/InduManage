package com.indumanage.indumanage.service;

import com.indumanage.indumanage.model.Ticket;
import com.indumanage.indumanage.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TicketService {
    
    private final TicketRepository ticketRepository;
    
    public Ticket crear(Ticket ticket) {
        ticket.setFechaCreacion(LocalDateTime.now());
        ticket.setFechaActualizacion(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }
    
    public Optional<Ticket> buscarPorId(String id) {
        return ticketRepository.findById(id);
    }
    
    public List<Ticket> listarTodos() {
        return ticketRepository.findAll();
    }
    
    public List<Ticket> listarPorOperario(String operarioId) {
        return ticketRepository.findByOperarioId(operarioId);
    }
    
    public List<Ticket> listarPorProducto(String productoId) {
        return ticketRepository.findByProductoId(productoId);
    }
    
    public Ticket actualizar(Ticket ticket) {
        ticket.setFechaActualizacion(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }
    
    public Ticket responder(String ticketId, String respuesta) {
        return ticketRepository.findById(ticketId)
            .map(ticket -> {
                ticket.setRespuestaAdmin(respuesta);
                ticket.setFechaRespuesta(LocalDateTime.now());
                ticket.setFechaActualizacion(LocalDateTime.now());
                return ticketRepository.save(ticket);
            })
            .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
    }
    
    public void eliminar(String id) {
        ticketRepository.deleteById(id);
    }
}
