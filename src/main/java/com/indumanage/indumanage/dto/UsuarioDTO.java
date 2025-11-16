package com.indumanage.indumanage.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UsuarioDTO {
    private String id;
    private String nombre;
    private String correo;
    private String password;
    private String telefono;
    private String direccion;
    private String rol;
    private Boolean activo;
    private LocalDateTime fechaCreacion;
}
