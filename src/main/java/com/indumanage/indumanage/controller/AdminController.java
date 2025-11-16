package com.indumanage.indumanage.controller;

import com.indumanage.indumanage.dto.UsuarioDTO;
import com.indumanage.indumanage.model.Role;
import com.indumanage.indumanage.model.Usuario;
import com.indumanage.indumanage.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    private final UsuarioService usuarioService;
    
    // Listar todos los usuarios
    @GetMapping("/usuarios")
    public ResponseEntity<List<UsuarioDTO>> listarUsuarios() {
        List<Usuario> usuarios = usuarioService.listarTodos();
        List<UsuarioDTO> usuariosDTO = usuarios.stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(usuariosDTO);
    }
    
    // Obtener un usuario por ID
    @GetMapping("/usuarios/{id}")
    public ResponseEntity<UsuarioDTO> obtenerUsuario(@PathVariable String id) {
        Usuario usuario = usuarioService.buscarPorId(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return ResponseEntity.ok(convertirADTO(usuario));
    }
    
    // Crear nuevo usuario
    @PostMapping("/usuarios")
    public ResponseEntity<?> crearUsuario(@RequestBody UsuarioDTO usuarioDTO) {
        try {
            // Validar que no sea rol ADMIN
            if ("ADMIN".equals(usuarioDTO.getRol())) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "No se puede crear usuarios con rol ADMIN");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            // Validar que el correo no exista
            if (usuarioService.buscarPorCorreo(usuarioDTO.getCorreo()).isPresent()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "El correo ya está registrado");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            Usuario nuevoUsuario = new Usuario();
            nuevoUsuario.setNombre(usuarioDTO.getNombre());
            nuevoUsuario.setCorreo(usuarioDTO.getCorreo());
            nuevoUsuario.setContrasena(usuarioDTO.getPassword());
            nuevoUsuario.setTelefono(usuarioDTO.getTelefono());
            nuevoUsuario.setRol(Role.valueOf(usuarioDTO.getRol()));
            nuevoUsuario.setActivo(true);
            
            Usuario usuarioCreado = usuarioService.registrar(nuevoUsuario);
            return ResponseEntity.status(HttpStatus.CREATED).body(convertirADTO(usuarioCreado));
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error al crear usuario: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    // Actualizar usuario
    @PutMapping("/usuarios/{id}")
    public ResponseEntity<?> actualizarUsuario(@PathVariable String id, @RequestBody UsuarioDTO usuarioDTO) {
        try {
            Usuario usuario = usuarioService.buscarPorId(id)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            // No permitir cambiar a rol ADMIN
            if ("ADMIN".equals(usuarioDTO.getRol()) && !"ADMIN".equals(usuario.getRol())) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "No se puede cambiar el rol a ADMIN");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            // Actualizar campos
            if (usuarioDTO.getNombre() != null) {
                usuario.setNombre(usuarioDTO.getNombre());
            }
            if (usuarioDTO.getTelefono() != null) {
                usuario.setTelefono(usuarioDTO.getTelefono());
            }
            if (usuarioDTO.getRol() != null) {
                usuario.setRol(Role.valueOf(usuarioDTO.getRol()));
            }
            if (usuarioDTO.getActivo() != null) {
                usuario.setActivo(usuarioDTO.getActivo());
            }
            
            Usuario usuarioActualizado = usuarioService.actualizar(usuario);
            return ResponseEntity.ok(convertirADTO(usuarioActualizado));
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error al actualizar usuario: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    // Desactivar usuario (soft delete)
    @DeleteMapping("/usuarios/{id}")
    public ResponseEntity<?> desactivarUsuario(@PathVariable String id) {
        try {
            Usuario usuario = usuarioService.buscarPorId(id)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            // No permitir desactivar admins
            if ("ADMIN".equals(usuario.getRol())) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "No se puede desactivar usuarios administradores");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            usuario.setActivo(false);
            usuarioService.actualizar(usuario);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Usuario desactivado exitosamente");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error al desactivar usuario: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    // Convertir Usuario a DTO
    private UsuarioDTO convertirADTO(Usuario usuario) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(usuario.getId());
        dto.setNombre(usuario.getNombre());
        dto.setCorreo(usuario.getCorreo());
        dto.setTelefono(usuario.getTelefono());
        dto.setRol(usuario.getRol().name());
        dto.setActivo(usuario.isActivo());
        dto.setFechaCreacion(usuario.getFechaCreacion());
        return dto;
    }
}
