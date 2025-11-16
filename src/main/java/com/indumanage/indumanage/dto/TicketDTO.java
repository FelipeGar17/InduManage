package com.indumanage.indumanage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketDTO {
    private String id;
    private String productoId;
    private String productoCodigo;
    private String productoNombre;
    private String tipoReporte;
    private String descripcion;
    private String estado;
    private String respuestaAdmin;
    private String operarioId;
    private String operarioNombre;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    private LocalDateTime fechaRespuesta;
}
