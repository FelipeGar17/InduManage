package com.indumanage.indumanage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrdenDTO {
    
    private String id;
    
    // Información del cliente
    private String clienteId;
    private String clienteNombre;
    private String clienteCorreo;
    private String clienteTelefono;
    
    // Información de la orden
    private String numeroOrden;
    private String tipoOrden; // VENTA, ALQUILER, MIXTA
    private String estado; // PENDIENTE, EN_REVISION, etc.
    
    // Items de la orden
    private List<ItemOrdenDTO> items;
    
    // Totales
    private Double subtotal;
    private Double impuestos;
    private Double total;
    
    // Observaciones
    private String observacionesCliente;
    private String observacionesAdmin;
    private String motivoRechazo;
    
    // Fechas
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    private LocalDateTime fechaAprobacion;
    private LocalDateTime fechaCompletado;
    
    // Información de entrega
    private String direccionEntrega;
    private String metodoEntrega;
}
