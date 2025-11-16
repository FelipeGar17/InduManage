package com.indumanage.indumanage.repository;

import com.indumanage.indumanage.model.Role;
import com.indumanage.indumanage.model.Usuario;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends MongoRepository<Usuario, String> {
    
    Optional<Usuario> findByCorreo(String correo);
    
    boolean existsByCorreo(String correo);
    
    List<Usuario> findByRol(Role rol);
    
    List<Usuario> findByActivoTrue();
}
