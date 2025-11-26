package com.indumanage.indumanage.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CrearOrdenRequest {
    
    @NotNull(message = "Los items son obligatorios")
    @NotEmpty(message = "Debe haber al menos un item")
    private List<ItemOrdenDTO> items;
    
    private String observacionesCliente;
    private String direccionEntrega;
    private String metodoEntrega; // RETIRO_LOCAL, ENVIO_DOMICILIO
}
