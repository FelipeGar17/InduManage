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
    
    private LocalDate fechaAdquisicion;
    
    private String observaciones;
    
    private boolean activo;
    
    private LocalDateTime fechaCreacion;
    
    private LocalDateTime fechaActualizacion;
}
