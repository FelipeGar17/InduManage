package com.indumanage.indumanage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemOrdenDTO {
    
    private String productoId;
    private String productoCodigo;
    private String productoNombre;
    private String tipoProducto; // MAQUINARIA o REPUESTO
    
    // Para REPUESTOS (Venta)
    private Integer cantidad;
    private Double precioUnitario;
    private Double subtotal;
    
    // Para MAQUINARIA (Alquiler)
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private Integer diasAlquiler;
    private Double precioDiario;
    private Double totalAlquiler;
    
    // Campo general
    private Double total;
}