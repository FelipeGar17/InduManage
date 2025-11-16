# 📘 Guía Sprint 3 - Módulo de Clientes

## 👋 Bienvenido

Esta guía te ayudará a continuar el desarrollo del **módulo de clientes** de InduManage. Aquí encontrarás toda la información necesaria sobre la estructura del proyecto, funcionalidades pendientes y ejemplos de código.

---

## 📁 Estructura de Archivos del Proyecto

### Backend (Java/Spring Boot)

```
src/main/java/com/indumanage/indumanage/
├── config/
│   ├── DataInitializer.java          # Crea usuarios iniciales (ADMIN, OPERARIO)
│   └── SecurityConfig.java           # Configuración de seguridad y rutas
│
├── controller/
│   ├── AdminController.java          # CRUD de usuarios (ADMIN)
│   ├── AdminTicketController.java    # Gestión completa de tickets (ADMIN)
│   ├── AuthController.java           # Login y registro
│   ├── OperarioProductoController.java   # Vista de productos para operario
│   ├── OperarioTicketController.java     # Crear y ver tickets (OPERARIO)
│   ├── ProductoController.java       # CRUD completo de productos (ADMIN)
│   └── 🚧 ClienteController.java     # ⬅️ CREAR ESTE (ver más abajo)
│
├── dto/
│   ├── LoginDTO.java                 # DTO para login
│   ├── RegistroDTO.java              # DTO para registro
│   ├── TicketDTO.java                # DTO para tickets
│   └── 🚧 AlquilerDTO.java           # ⬅️ CREAR ESTE (ver más abajo)
│
├── model/
│   ├── Usuario.java                  # Entidad Usuario
│   ├── Producto.java                 # Entidad Producto (agregar campo costoAlquilerDia)
│   ├── Ticket.java                   # Entidad Ticket
│   └── 🚧 Alquiler.java              # ⬅️ CREAR ESTE (ver más abajo)
│
├── repository/
│   ├── UsuarioRepository.java
│   ├── ProductoRepository.java
│   ├── TicketRepository.java
│   └── 🚧 AlquilerRepository.java    # ⬅️ CREAR ESTE
│
├── security/
│   ├── JwtAuthenticationFilter.java  # Filtro JWT
│   └── JwtUtil.java                  # Utilidades JWT
│
└── service/
    ├── UsuarioService.java
    ├── ProductoService.java
    ├── TicketService.java
    └── 🚧 AlquilerService.java       # ⬅️ CREAR ESTE
```

### Frontend (HTML/CSS/JS)

```
src/main/resources/static/
├── index.html                        # Página de login
├── admin/
│   ├── dashboard.html                # Dashboard admin con gestión de usuarios
│   ├── gestion-productos.html        # CRUD de productos
│   └── gestion-tickets.html          # Gestión de tickets
│
├── operario/
│   └── dashboard.html                # Dashboard operario (ver productos y tickets)
│
├── cliente/                          # 🚧 CARPETA PARA SPRINT 3
│   └── 🚧 dashboard.html             # ⬅️ CREAR ESTE (ver más abajo)
│
├── css/
│   ├── login.css                     # Estilos del login
│   ├── admin/
│   │   ├── dashboard.css             # Estilos base admin (reutilizar)
│   │   ├── gestion-productos.css
│   │   └── gestion-tickets.css
│   ├── operario/
│   │   └── operario.css              # Estilos operario
│   └── cliente/                      # 🚧 CREAR ESTA CARPETA
│       └── 🚧 dashboard.css          # ⬅️ CREAR ESTE (reutilizar css/admin/dashboard.css)
│
└── js/
    ├── login.js                      # Lógica de login
    ├── admin/
    │   ├── dashboard.js              # Lógica dashboard admin
    │   ├── gestion-productos.js
    │   └── gestion-tickets.js
    ├── operario/
    │   └── dashboard.js              # Lógica dashboard operario
    └── cliente/                      # 🚧 CREAR ESTA CARPETA
        └── 🚧 dashboard.js           # ⬅️ CREAR ESTE (ver más abajo)
```

---

## 🎯 Funcionalidades del Sprint 3

### 1. Agregar Campo de Costo de Alquiler

#### a) Modificar el modelo `Producto.java`

**Ubicación:** `src/main/java/com/indumanage/indumanage/model/Producto.java`

Agregar este campo:

```java
@Document(collection = "productos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Producto {
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String codigo;
    
    private TipoProducto tipo;
    private TipoMaquinaria tipoMaquinaria; // solo para MAQUINARIA
    private String nombre;
    private String descripcion;
    private String categoria;
    private String ubicacion;
    private EstadoMaquinaria estado; // solo para MAQUINARIA
    private Integer stock; // solo para REPUESTO
    
    // ⬇️⬇️⬇️ AGREGAR ESTE CAMPO ⬇️⬇️⬇️
    private Double costoAlquilerDia; // Costo de alquiler por día (solo para MAQUINARIA)
    // ⬆️⬆️⬆️ AGREGAR ESTE CAMPO ⬆️⬆️⬆️
    
    private LocalDate fechaAdquisicion;
    private String observaciones;
    private Boolean activo = true;
    
    @CreatedDate
    private LocalDateTime fechaCreacion;
    
    @LastModifiedDate
    private LocalDateTime fechaActualizacion;
}
```

#### b) Actualizar el formulario de productos en el frontend

**Ubicación:** `src/main/resources/static/admin/gestion-productos.html`

En el modal de crear/editar producto, agregar este campo después del campo `tipoMaquinaria`:

```html
<!-- Costo de Alquiler por Día (solo para MAQUINARIA) -->
<div class="col-md-6" id="containerCostoAlquiler" style="display: none;">
    <label class="form-label">Costo de Alquiler por Día</label>
    <div class="input-group">
        <span class="input-group-text">$</span>
        <input type="number" class="form-control" id="productoCostoAlquiler" 
               placeholder="Ejemplo: 150000" min="0" step="1000">
    </div>
    <small class="text-muted">Costo diario para alquiler del equipo</small>
</div>
```

#### c) Actualizar el JavaScript para mostrar/ocultar el campo

**Ubicación:** `src/main/resources/static/js/admin/gestion-productos.js`

En la función que controla campos condicionales, agregar:

```javascript
// Mostrar/ocultar campos según el tipo de producto
document.getElementById('productoTipo').addEventListener('change', function() {
    const tipo = this.value;
    
    // Campos para MAQUINARIA
    const containerMaquinaria = document.getElementById('containerTipoMaquinaria');
    const containerEstado = document.getElementById('containerEstado');
    const containerCostoAlquiler = document.getElementById('containerCostoAlquiler'); // ⬅️ AGREGAR
    const containerStock = document.getElementById('containerStock');
    
    if (tipo === 'MAQUINARIA') {
        containerMaquinaria.style.display = 'block';
        containerEstado.style.display = 'block';
        containerCostoAlquiler.style.display = 'block'; // ⬅️ AGREGAR
        containerStock.style.display = 'none';
        
        document.getElementById('productoTipoMaquinaria').required = true;
        document.getElementById('productoEstado').required = true;
        document.getElementById('productoCostoAlquiler').required = true; // ⬅️ AGREGAR
        document.getElementById('productoStock').required = false;
    } else {
        containerMaquinaria.style.display = 'none';
        containerEstado.style.display = 'none';
        containerCostoAlquiler.style.display = 'none'; // ⬅️ AGREGAR
        containerStock.style.display = 'block';
        
        document.getElementById('productoTipoMaquinaria').required = false;
        document.getElementById('productoEstado').required = false;
        document.getElementById('productoCostoAlquiler').required = false; // ⬅️ AGREGAR
        document.getElementById('productoStock').required = true;
    }
});
```

---

### 2. Crear Modelo de Alquiler

#### Crear archivo `Alquiler.java`

**Ubicación:** `src/main/java/com/indumanage/indumanage/model/Alquiler.java`

```java
package com.indumanage.indumanage.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "alquileres")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Alquiler {
    @Id
    private String id;
    
    // Cliente
    private String clienteId;
    private String clienteNombre;
    private String clienteEmail;
    
    // Producto
    private String productoId;
    private String productoCodigo;
    private String productoNombre;
    
    // Alquiler
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private Integer diasAlquiler;
    private Double costoDiario;
    private Double costoTotal;
    
    // Estado
    private EstadoAlquiler estado;
    
    // Observaciones
    private String observaciones;
    
    @CreatedDate
    private LocalDateTime fechaCreacion;
    
    @LastModifiedDate
    private LocalDateTime fechaActualizacion;
}
```

#### Crear enum `EstadoAlquiler.java`

**Ubicación:** `src/main/java/com/indumanage/indumanage/model/EstadoAlquiler.java`

```java
package com.indumanage.indumanage.model;

public enum EstadoAlquiler {
    ACTIVO,      // Alquiler en curso
    FINALIZADO,  // Alquiler terminado
    CANCELADO    // Alquiler cancelado
}
```

---

### 3. Crear Repositorio de Alquiler

**Ubicación:** `src/main/java/com/indumanage/indumanage/repository/AlquilerRepository.java`

```java
package com.indumanage.indumanage.repository;

import com.indumanage.indumanage.model.Alquiler;
import com.indumanage.indumanage.model.EstadoAlquiler;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlquilerRepository extends MongoRepository<Alquiler, String> {
    List<Alquiler> findByClienteId(String clienteId);
    List<Alquiler> findByEstado(EstadoAlquiler estado);
    List<Alquiler> findByClienteIdAndEstado(String clienteId, EstadoAlquiler estado);
}
```

---

### 4. Crear Servicio de Alquiler

**Ubicación:** `src/main/java/com/indumanage/indumanage/service/AlquilerService.java`

```java
package com.indumanage.indumanage.service;

import com.indumanage.indumanage.model.Alquiler;
import com.indumanage.indumanage.model.EstadoAlquiler;
import com.indumanage.indumanage.repository.AlquilerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AlquilerService {
    private final AlquilerRepository alquilerRepository;
    
    public List<Alquiler> listarTodos() {
        return alquilerRepository.findAll();
    }
    
    public List<Alquiler> listarPorCliente(String clienteId) {
        return alquilerRepository.findByClienteId(clienteId);
    }
    
    public List<Alquiler> listarActivos() {
        return alquilerRepository.findByEstado(EstadoAlquiler.ACTIVO);
    }
    
    public List<Alquiler> listarActivosPorCliente(String clienteId) {
        return alquilerRepository.findByClienteIdAndEstado(clienteId, EstadoAlquiler.ACTIVO);
    }
    
    public Optional<Alquiler> buscarPorId(String id) {
        return alquilerRepository.findById(id);
    }
    
    public Alquiler crear(Alquiler alquiler) {
        // Calcular días y costo total
        long dias = ChronoUnit.DAYS.between(alquiler.getFechaInicio(), alquiler.getFechaFin());
        alquiler.setDiasAlquiler((int) dias);
        alquiler.setCostoTotal(alquiler.getCostoDiario() * dias);
        alquiler.setEstado(EstadoAlquiler.ACTIVO);
        
        return alquilerRepository.save(alquiler);
    }
    
    public Alquiler actualizar(Alquiler alquiler) {
        return alquilerRepository.save(alquiler);
    }
    
    public void eliminar(String id) {
        alquilerRepository.deleteById(id);
    }
}
```

---

### 5. Crear Controlador de Cliente

**Ubicación:** `src/main/java/com/indumanage/indumanage/controller/ClienteController.java`

```java
package com.indumanage.indumanage.controller;

import com.indumanage.indumanage.model.Alquiler;
import com.indumanage.indumanage.model.Producto;
import com.indumanage.indumanage.service.AlquilerService;
import com.indumanage.indumanage.service.ProductoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cliente")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CLIENTE')")
public class ClienteController {
    
    private final AlquilerService alquilerService;
    private final ProductoService productoService;
    
    // Ver productos disponibles para alquiler
    @GetMapping("/productos-disponibles")
    public ResponseEntity<List<Producto>> listarProductosDisponibles() {
        List<Producto> productos = productoService.listarTodos()
            .stream()
            .filter(p -> p.getActivo() && p.getCostoAlquilerDia() != null)
            .toList();
        return ResponseEntity.ok(productos);
    }
    
    // Ver mis alquileres activos
    @GetMapping("/alquileres/activos")
    public ResponseEntity<List<Alquiler>> listarAlquileresActivos(@RequestParam String clienteId) {
        return ResponseEntity.ok(alquilerService.listarActivosPorCliente(clienteId));
    }
    
    // Ver historial completo de alquileres
    @GetMapping("/alquileres/historial")
    public ResponseEntity<List<Alquiler>> listarHistorial(@RequestParam String clienteId) {
        return ResponseEntity.ok(alquilerService.listarPorCliente(clienteId));
    }
    
    // Ver detalle de un alquiler
    @GetMapping("/alquileres/{id}")
    public ResponseEntity<?> verAlquiler(@PathVariable String id) {
        return alquilerService.buscarPorId(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}
```

---

### 6. Actualizar SecurityConfig

**Ubicación:** `src/main/java/com/indumanage/indumanage/config/SecurityConfig.java`

Agregar las rutas de cliente:

```java
// Permitir acceso a páginas estáticas según rol
.requestMatchers("/admin/**", "/operario/**", "/cliente/**").permitAll()

// Proteger endpoints de API
.requestMatchers("/api/admin/**").hasRole("ADMIN")
.requestMatchers("/api/operario/**").hasRole("OPERARIO")
.requestMatchers("/api/cliente/**").hasRole("CLIENTE") // ⬅️ AGREGAR ESTA LÍNEA
```

---

### 7. Frontend - Dashboard Cliente

#### Crear `cliente/dashboard.html`

**Ubicación:** `src/main/resources/static/cliente/dashboard.html`

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Cliente - InduManage</title>
    
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
    <link rel="stylesheet" href="../css/admin/dashboard.css">
    <link rel="stylesheet" href="../css/cliente/dashboard.css">
</head>
<body>
    <!-- Sidebar -->
    <div class="sidebar" id="sidebar">
        <div class="sidebar-header">
            <div class="logo-container">
                <i class="bi bi-truck-front-fill"></i>
                <span class="logo-text">InduManage</span>
            </div>
        </div>
        
        <div class="user-info">
            <div class="user-avatar">
                <i class="bi bi-person-circle"></i>
            </div>
            <div class="user-details">
                <span class="user-name" id="clienteUserName">Cliente</span>
                <span class="user-role" id="clienteUserRole">CLIENTE</span>
            </div>
        </div>
        
        <nav class="sidebar-nav">
            <a href="#dashboard" class="nav-item active" data-section="dashboard">
                <i class="bi bi-speedometer2"></i>
                <span>Dashboard</span>
            </a>
            
            <div class="nav-section-title">ALQUILERES</div>
            <a href="#alquileres" class="nav-item" data-section="alquileres">
                <i class="bi bi-box-seam"></i>
                <span>Mis Alquileres</span>
            </a>
            <a href="#productos" class="nav-item" data-section="productos">
                <i class="bi bi-search"></i>
                <span>Productos Disponibles</span>
            </a>
            
            <a href="#" class="nav-item logout-btn" id="logoutBtn">
                <i class="bi bi-box-arrow-right"></i>
                <span>Cerrar Sesión</span>
            </a>
        </nav>
    </div>
    
    <!-- Main Content -->
    <div class="main-content">
        <nav class="navbar">
            <button class="sidebar-toggle" id="sidebarToggle">
                <i class="bi bi-list"></i>
            </button>
            <div class="navbar-title">
                <h4>Dashboard Cliente</h4>
            </div>
        </nav>
        
        <div class="content-area">
            <!-- Sección Dashboard -->
            <section id="seccionDashboard" class="content-section active">
                <h2>Bienvenido</h2>
                <div class="row">
                    <div class="col-md-4">
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="bi bi-box-seam"></i>
                            </div>
                            <div class="stat-details">
                                <h3 id="statAlquileresActivos">0</h3>
                                <p>Alquileres Activos</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="bi bi-clock-history"></i>
                            </div>
                            <div class="stat-details">
                                <h3 id="statHistorial">0</h3>
                                <p>Total Alquileres</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="bi bi-currency-dollar"></i>
                            </div>
                            <div class="stat-details">
                                <h3 id="statGastoTotal">$0</h3>
                                <p>Gasto Total</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            <!-- Sección Alquileres -->
            <section id="seccionAlquileres" class="content-section" style="display: none;">
                <h2>Mis Alquileres</h2>
                <!-- Aquí va la tabla de alquileres -->
            </section>
            
            <!-- Sección Productos -->
            <section id="seccionProductos" class="content-section" style="display: none;">
                <h2>Productos Disponibles</h2>
                <!-- Aquí va el catálogo de productos -->
            </section>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="../js/cliente/dashboard.js"></script>
</body>
</html>
```

---

### 8. Actualizar login.js para redirigir clientes

**Ubicación:** `src/main/resources/static/js/login.js`

Asegúrate de que esta función esté así:

```javascript
function redirigirSegunRol(rol) {
    if (rol === 'ADMIN') {
        window.location.href = '/admin/dashboard.html';
    } else if (rol === 'OPERARIO') {
        window.location.href = '/operario/dashboard.html';
    } else if (rol === 'CLIENTE') {
        window.location.href = '/cliente/dashboard.html'; // ⬅️ AGREGAR ESTA LÍNEA
    } else {
        alert('Rol no reconocido');
    }
}
```

---

## 🎨 Paleta de Colores

Para mantener la consistencia visual:

```css
/* Colores principales */
--primary-orange: #ff9800;
--primary-black: #000000;
--primary-white: #ffffff;
--sidebar-bg: #1a1a1a;
--text-muted: #666666;
```

---

## 📋 Checklist Sprint 3

- [ ] Agregar campo `costoAlquilerDia` en modelo `Producto.java`
- [ ] Actualizar formulario de productos para incluir costo de alquiler
- [ ] Crear modelo `Alquiler.java` y enum `EstadoAlquiler`
- [ ] Crear `AlquilerRepository.java`
- [ ] Crear `AlquilerService.java`
- [ ] Crear `ClienteController.java` con endpoints
- [ ] Actualizar `SecurityConfig.java` para rutas de cliente
- [ ] Crear `cliente/dashboard.html`
- [ ] Crear `css/cliente/dashboard.css`
- [ ] Crear `js/cliente/dashboard.js`
- [ ] Actualizar `login.js` para redirección de clientes
- [ ] Probar login como cliente
- [ ] Probar visualización de productos disponibles
- [ ] Probar creación de alquileres
- [ ] Probar historial de alquileres

---

## 💡 Tips

1. **Reutiliza estilos:** El CSS de admin dashboard funciona perfectamente para cliente
2. **Copia patrones:** Mira cómo funciona el dashboard de operario para inspirarte
3. **Endpoints REST:** Sigue el mismo patrón que AdminController y OperarioController
4. **Validaciones:** Asegúrate de que solo productos con `costoAlquilerDia` se muestren a clientes
5. **Testing:** Prueba con Postman antes de crear el frontend

---

## 🚀 ¿Dudas?

Consulta el código existente en:
- `AdminController.java` - Para ver cómo hacer CRUD
- `OperarioProductoController.java` - Para ver cómo filtrar productos
- `TicketService.java` - Para ver lógica de negocio
- `admin/dashboard.html` - Para ver estructura de dashboard
- `js/admin/gestion-productos.js` - Para ver manejo de formularios

¡Éxito con el Sprint 3! 🎉
