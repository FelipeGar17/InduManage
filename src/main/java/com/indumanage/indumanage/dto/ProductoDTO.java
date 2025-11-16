package com.indumanage.indumanage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductoDTO {
    private String id;
    private String codigo;
    private String tipo; // MAQUINARIA o REPUESTO
    private String tipoMaquinaria; // GRANDE, MEDIANA, PEQUEÑA
    private String nombre;
    private String descripcion;
    private String categoria;
    private String ubicacion;
    private String estado; // FUNCIONANDO, MANTENIMIENTO, REVISION, BAJA
    private Integer stock;
    private LocalDate fechaAdquisicion;
    private String observaciones;
    private Boolean activo;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
}
