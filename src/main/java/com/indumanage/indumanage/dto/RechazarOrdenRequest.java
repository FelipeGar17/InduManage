package com.indumanage.indumanage.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RechazarOrdenRequest {
    
    @NotBlank(message = "El motivo de rechazo es obligatorio")
    private String motivoRechazo;
    
    private String observacionesAdmin;
}