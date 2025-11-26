package com.indumanage.indumanage.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "ordenes")
public class Orden {
    
    @Id
    private String id;
    
    // Información del cliente
    private String clienteId;
    private String clienteNombre;
    private String clienteCorreo;
    private String clienteTelefono;
    
    // Información de la orden
    private String numeroOrden; // Ej: ORD-2025-0001
    private TipoOrden tipoOrden;
    private EstadoOrden estado;
    
    // Items de la orden
    private List<ItemOrden> items;
    
    // Totales
    private Double subtotal;
    private Double impuestos; // IVA u otros
    private Double total;
    
    // Observaciones y seguimiento
    private String observacionesCliente;
    private String observacionesAdmin;
    private String motivoRechazo; // Si fue rechazada
    
    // Fechas
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    private LocalDateTime fechaAprobacion;
    private LocalDateTime fechaCompletado;
    
    // Información de entrega (opcional)
    private String direccionEntrega;
    private String metodoEntrega; // RETIRO_LOCAL, ENVIO_DOMICILIO
}
