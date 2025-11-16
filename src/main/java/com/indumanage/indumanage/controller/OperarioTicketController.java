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
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/operario/tickets")
@RequiredArgsConstructor
@PreAuthorize("hasRole('OPERARIO')")
public class OperarioTicketController {
    
    private final TicketService ticketService;
    
    @GetMapping("/mis-tickets")
    public ResponseEntity<List<TicketDTO>> listarMisTickets(@RequestParam String operarioId) {
        List<TicketDTO> tickets = ticketService.listarPorOperario(operarioId).stream()
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
    
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody TicketDTO ticketDTO) {
        try {
            Ticket ticket = convertirATicket(ticketDTO);
            ticket.setEstado(EstadoTicket.PENDIENTE);
            Ticket ticketGuardado = ticketService.crear(ticket);
            return ResponseEntity.ok(convertirADTO(ticketGuardado));
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
    
    private Ticket convertirATicket(TicketDTO dto) {
        Ticket ticket = new Ticket();
        ticket.setProductoId(dto.getProductoId());
        ticket.setProductoCodigo(dto.getProductoCodigo());
        ticket.setProductoNombre(dto.getProductoNombre());
        ticket.setTipoReporte(TipoReporte.valueOf(dto.getTipoReporte()));
        ticket.setDescripcion(dto.getDescripcion());
        ticket.setOperarioId(dto.getOperarioId());
        ticket.setOperarioNombre(dto.getOperarioNombre());
        return ticket;
    }
}
