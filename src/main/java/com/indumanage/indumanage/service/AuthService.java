package com.indumanage.indumanage.service;

import com.indumanage.indumanage.dto.AuthResponse;
import com.indumanage.indumanage.dto.LoginRequest;
import com.indumanage.indumanage.dto.RegistroRequest;
import com.indumanage.indumanage.model.Role;
import com.indumanage.indumanage.model.Usuario;
import com.indumanage.indumanage.repository.UsuarioRepository;
import com.indumanage.indumanage.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    
    public AuthResponse registrarCliente(RegistroRequest request) {
        // Validar que el correo no exista
        if (usuarioRepository.existsByCorreo(request.getCorreo())) {
            throw new RuntimeException("El correo ya está registrado");
        }
        
        // Crear nuevo usuario
        Usuario usuario = new Usuario();
        usuario.setCorreo(request.getCorreo());
        usuario.setContrasena(passwordEncoder.encode(request.getContrasena()));
        usuario.setNombre(request.getNombre());
        usuario.setApellido(request.getApellido());
        usuario.setTelefono(request.getTelefono());
        usuario.setRol(Role.CLIENTE);
        usuario.setActivo(true);
        usuario.setFechaCreacion(LocalDateTime.now());
        usuario.setFechaActualizacion(LocalDateTime.now());
        
        usuario = usuarioRepository.save(usuario);
        
        // Generar token
        String token = jwtUtil.generateToken(usuario.getCorreo(), usuario.getRol().name());
        
        return new AuthResponse(
            token,
            usuario.getId(),
            usuario.getCorreo(),
            usuario.getNombre(),
            usuario.getApellido(),
            usuario.getRol()
        );
    }
    
    public AuthResponse login(LoginRequest request) {
        // Autenticar usuario
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getCorreo(),
                request.getContrasena()
            )
        );
        
        // Buscar usuario
        Usuario usuario = usuarioRepository.findByCorreo(request.getCorreo())
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // Validar que esté activo
        if (!usuario.isActivo()) {
            throw new RuntimeException("Usuario desactivado");
        }
        
        // Generar token
        String token = jwtUtil.generateToken(usuario.getCorreo(), usuario.getRol().name());
        
        return new AuthResponse(
            token,
            usuario.getId(),
            usuario.getCorreo(),
            usuario.getNombre(),
            usuario.getApellido(),
            usuario.getRol()
        );
    }
}
