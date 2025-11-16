package com.indumanage.indumanage.controller;

import com.indumanage.indumanage.dto.TicketDTO;
import com.indumanage.indumanage.model.EstadoTicket;
import com.indumanage.indumanage.model.Ticket;
import com.indumanage.indumanage.model.TipoReporte;
import com.indumanage.indumanage.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/tickets")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminTicketController {
    
    private final TicketService ticketService;
    
    @GetMapping
    public ResponseEntity<List<TicketDTO>> listarTodos() {
        List<TicketDTO> tickets = ticketService.listarTodos().stream()
            .map(this::convertirADTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(tickets);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<TicketDTO> obtenerPorId(@PathVariable String id) {
        return ticketService.buscarPorId(id)
            .map(ticket -> ResponseEntity.ok(convertirADTO(ticket)))
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/{id}/responder")
    public ResponseEntity<?> responder(@PathVariable String id, @RequestBody Map<String, String> body) {
        try {
            String respuesta = body.get("respuesta");
            Ticket ticket = ticketService.responder(id, respuesta);
            return ResponseEntity.ok(convertirADTO(ticket));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable String id, @RequestBody Map<String, String> body) {
        try {
            String estado = body.get("estado");
            return ticketService.buscarPorId(id)
                .map(ticket -> {
                    ticket.setEstado(EstadoTicket.valueOf(estado));
                    Ticket ticketActualizado = ticketService.actualizar(ticket);
                    return ResponseEntity.ok(convertirADTO(ticketActualizado));
                })
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable String id) {
        try {
            ticketService.eliminar(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    private TicketDTO convertirADTO(Ticket ticket) {
        TicketDTO dto = new TicketDTO();
        dto.setId(ticket.getId());
        dto.setProductoId(ticket.getProductoId());
        dto.setProductoCodigo(ticket.getProductoCodigo());
        dto.setProductoNombre(ticket.getProductoNombre());
        dto.setTipoReporte(ticket.getTipoReporte().name());
        dto.setDescripcion(ticket.getDescripcion());
        dto.setEstado(ticket.getEstado().name());
        dto.setRespuestaAdmin(ticket.getRespuestaAdmin());
        dto.setOperarioId(ticket.getOperarioId());
        dto.setOperarioNombre(ticket.getOperarioNombre());
        dto.setFechaCreacion(ticket.getFechaCreacion());
        dto.setFechaActualizacion(ticket.getFechaActualizacion());
        dto.setFechaRespuesta(ticket.getFechaRespuesta());
        return dto;
    }
}
