package com.indumanage.indumanage.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CambiarEstadoOrdenRequest {
    
    @NotBlank(message = "El estado es obligatorio")
    private String estado; // EN_PROCESO, COMPLETADA, etc.
    
    private String observaciones;
}
