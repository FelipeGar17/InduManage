package com.indumanage.indumanage.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tickets")
public class Ticket {
    
    @Id
    private String id;
    
    // Información del producto
    private String productoId;
    private String productoCodigo;
    private String productoNombre;
    
    // Información del ticket
    private TipoReporte tipoReporte;
    private String descripcion;
    private EstadoTicket estado;
    
    // Respuesta del admin
    private String respuestaAdmin;
    
    // Información del operario
    private String operarioId;
    private String operarioNombre;
    
    // Fechas
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    private LocalDateTime fechaRespuesta;
}
