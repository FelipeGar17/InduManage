package com.indumanage.indumanage.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "productos")
public class Producto {
    
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String codigo;
    
    private TipoProducto tipo;
    
    private TipoMaquinaria tipoMaquinaria; // Solo si tipo=MAQUINARIA
    
    private String nombre;
    
    private String descripcion;
    
    private String categoria;
    
    private String ubicacion;
    
    private EstadoMaquinaria estado; // Solo si tipo=MAQUINARIA
    
    private Integer stock; // Solo si tipo=REPUESTO
    
    // ===== NUEVOS CAMPOS PARA TIENDA =====
    
    private Double precio; // Precio de venta para REPUESTO o precio diario para MAQUINARIA
    
    private Double precioAlquilerDia; // Solo para MAQUINARIA - precio por día de alquiler
    
    private Double precioAlquilerSemana; // Solo para MAQUINARIA - precio por semana
    
    private Double precioAlquilerMes; // Solo para MAQUINARIA - precio por mes
    
    private Integer stockMinimo; // Solo para REPUESTO - alerta de stock bajo
    
    private String imagenUrl; // URL de imagen del producto
    
    private Boolean disponibleVenta; // true si está disponible para venta/alquiler
    
    // ===== CAMPOS EXISTENTES =====
    
    private LocalDate fechaAdquisicion;
    
    private String observaciones;
    
    private boolean activo;
    
    private LocalDateTime fechaCreacion;
    
    private LocalDateTime fechaActualizacion;
}
