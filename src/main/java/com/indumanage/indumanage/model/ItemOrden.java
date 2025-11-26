package com.indumanage.indumanage.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemOrden {
    
    private String productoId;
    private String productoCodigo;
    private String productoNombre;
    private TipoProducto tipoProducto; // MAQUINARIA o REPUESTO
    
    // Para REPUESTOS (Venta)
    private Integer cantidad;
    private Double precioUnitario;
    private Double subtotal; // cantidad * precioUnitario
    
    // Para MAQUINARIA (Alquiler)
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private Integer diasAlquiler;
    private Double precioDiario;
    private Double totalAlquiler; // diasAlquiler * precioDiario
    
    // Campo general
    private Double total; // subtotal o totalAlquiler según el tipo
}
