package com.indumanage.indumanage.dto;

import com.indumanage.indumanage.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    
    private String token;
    
    private String tipo = "Bearer";
    
    private String id;
    
    private String correo;
    
    private String nombre;
    
    private String apellido;
    
    private Role rol;
    
    public AuthResponse(String token, String id, String correo, String nombre, String apellido, Role rol) {
        this.token = token;
        this.id = id;
        this.correo = correo;
        this.nombre = nombre;
        this.apellido = apellido;
        this.rol = rol;
    }
}
