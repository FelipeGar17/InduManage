package com.indumanage.indumanage.config;

import com.indumanage.indumanage.model.Role;
import com.indumanage.indumanage.model.Usuario;
import com.indumanage.indumanage.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {
    
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Bean
    public CommandLineRunner initData() {
        return args -> {
            // Crear usuario ADMIN por defecto si no existe
            if (!usuarioRepository.existsByCorreo("admin@indumanage.com")) {
                Usuario admin = new Usuario();
                admin.setCorreo("admin@indumanage.com");
                admin.setContrasena(passwordEncoder.encode("admin123"));
                admin.setNombre("Administrador");
                admin.setApellido("Sistema");
                admin.setTelefono("1234567890");
                admin.setRol(Role.ADMIN);
                admin.setActivo(true);
                admin.setFechaCreacion(LocalDateTime.now());
                admin.setFechaActualizacion(LocalDateTime.now());
                
                usuarioRepository.save(admin);
                System.out.println("✅ Usuario ADMIN creado - Correo: admin@indumanage.com - Contraseña: admin123");
            }
            
            // Crear usuario OPERARIO de ejemplo si no existe
            if (!usuarioRepository.existsByCorreo("operario@indumanage.com")) {
                Usuario operario = new Usuario();
                operario.setCorreo("operario@indumanage.com");
                operario.setContrasena(passwordEncoder.encode("operario123"));
                operario.setNombre("Juan");
                operario.setApellido("Operario");
                operario.setTelefono("0987654321");
                operario.setRol(Role.OPERARIO);
                operario.setActivo(true);
                operario.setFechaCreacion(LocalDateTime.now());
                operario.setFechaActualizacion(LocalDateTime.now());
                
                usuarioRepository.save(operario);
                System.out.println("✅ Usuario OPERARIO creado - Correo: operario@indumanage.com - Contraseña: operario123");
            }
        };
    }
}
