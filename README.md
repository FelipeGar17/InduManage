# 🏭 InduManage

<div align="center">

**Sistema de Gestión Industrial Inteligente**

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.7-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

[Características](#-características) • [Capturas](#-capturas-de-pantalla) • [Instalación](#-instalación) • [Sprint 3](#-sprint-3---módulo-de-clientes)

</div>

---

## 📋 Descripción

**InduManage** es un sistema completo de gestión industrial diseñado específicamente para facilitar el control de inventarios, maquinaria, reportes de mantenimiento y gestión de personal en entornos industriales. Con una interfaz intuitiva y profesional, permite a los trabajadores de campo y administradores gestionar eficientemente todos los aspectos operativos de la empresa.

## ✨ Características

### 🔐 Sistema de Autenticación Robusto
- **JWT (JSON Web Tokens)** con tokens de 24 horas
- **Encriptación BCrypt** para contraseñas
- **Control de acceso basado en roles** (ADMIN, OPERARIO, CLIENTE)
- Rutas protegidas con Spring Security

### 👥 Gestión de Usuarios (Sprint 1 y 2)
- ✅ CRUD completo de usuarios
- ✅ Activación/desactivación de cuentas
- ✅ Roles diferenciados con dashboards personalizados
- ✅ Validación de usuarios activos en login

### 📦 Gestión de Inventario
- ✅ Control de **Maquinaria** (Grande, Mediana, Pequeña)
- ✅ Control de **Repuestos** con stock
- ✅ Estados de equipos (Funcionando, Mantenimiento, Revisión, Baja)
- ✅ **Autocompletado inteligente** para nombres, categorías y ubicaciones
- ✅ Filtros avanzados por tipo, estado, categoría
- ✅ Soft delete (eliminación lógica)

### 🎫 Sistema de Tickets y Reportes
- ✅ **Operarios** pueden reportar problemas en equipos
- ✅ Tipos de reporte: Falla/Avería, Requiere Mantenimiento, Observación, Solicitud de Revisión
- ✅ Estados: Pendiente, En Revisión, Resuelto, Cerrado
- ✅ **Administradores** gestionan tickets, cambian estados y responden
- ✅ Estadísticas en tiempo real por estado
- ✅ Historial completo de tickets con respuestas

### 🎨 Diseño Profesional
- **Paleta de colores industrial:** Blanco, Negro, Naranja (#ff9800)
- **Badges de colores** para estados y tipos
- **Interfaz responsive** con Bootstrap 5.3.0
- **Iconos profesionales** con Bootstrap Icons 1.11.0
- Diseñado para trabajadores industriales (interfaz clara y simple)

## 🖼️ Capturas de Pantalla

### Login
<div align="center">
  <img src="docs/images/login.png" alt="Login" width="700"/>
  <p><em>Pantalla de inicio de sesión con autenticación JWT</em></p>
</div>

### Dashboard Administrador
<div align="center">
  <img src="docs/images/admin-dashboard.png" alt="Dashboard Admin" width="700"/>
  <p><em>Panel de control con estadísticas y gestión de usuarios</em></p>
</div>

### Gestión de Productos
<div align="center">
  <img src="docs/images/productos.png" alt="Gestión de Productos" width="700"/>
  <p><em>CRUD completo con autocompletado y filtros avanzados</em></p>
</div>

### Gestión de Tickets
<div align="center">
  <img src="docs/images/tickets.png" alt="Gestión de Tickets" width="700"/>
  <p><em>Sistema de tickets con estadísticas y gestión de reportes</em></p>
</div>

### Dashboard Operario
<div align="center">
  <img src="docs/images/operario-dashboard.png" alt="Dashboard Operario" width="700"/>
  <p><em>Vista de operario para reportar problemas en equipos</em></p>
</div>

## 🚀 Instalación

### Requisitos Previos
- **Java 21** o superior
- **Maven 3.8+**
- **MongoDB Atlas** (cuenta gratuita) o MongoDB local
- IDE recomendado: **IntelliJ IDEA** o **Eclipse** con Spring Tools

### Configuración

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/indumanage.git
cd indumanage
```

2. **Configurar MongoDB**

Edita `src/main/resources/application.properties`:

```properties
# Para MongoDB Atlas
spring.data.mongodb.uri=mongodb+srv://usuario:password@cluster.mongodb.net/indumanage?retryWrites=true&w=majority

# O para MongoDB Local
spring.data.mongodb.host=localhost
spring.data.mongodb.port=27017
spring.data.mongodb.database=indumanage
```

3. **Configurar JWT Secret**

Cambia la clave secreta en `application.properties`:

```properties
jwt.secret=TuClaveSecretaSuperSeguraParaProduccion
jwt.expiration=86400000
```

4. **Compilar y ejecutar**

```bash
# Compilar el proyecto
mvn clean install

# Ejecutar la aplicación
mvn spring-boot:run
```

5. **Acceder a la aplicación**

Abre tu navegador en: `http://localhost:8080`

### Usuario por Defecto

Usuario administrador creado automáticamente:

| Rol | Email | Contraseña |
|-----|-------|------------|
| ADMIN | admin@indumanage.com | admin123 |
| OPERARIO | operario@indumanage.com | operario123 |

## 📖 Uso

### Roles y Permisos

| Rol | Permisos |
|-----|----------|
| **ADMIN** | Acceso completo: gestión de usuarios, productos, tickets, reportes |
| **OPERARIO** | Ver productos activos, crear tickets, ver sus propios tickets |
| **CLIENTE** | 🚧 En desarrollo (Sprint 3) |

### Flujo de Trabajo

1. **Login** → El sistema redirige automáticamente según el rol
2. **Admin Dashboard** → Gestionar usuarios, productos y tickets
3. **Operario Dashboard** → Ver maquinaria y reportar problemas
4. **Tickets** → El admin revisa, cambia estados y responde
5. **Reportes** → 🚧 En desarrollo

## 🏗️ Arquitectura

### Stack Tecnológico

**Backend:**
- Spring Boot 3.5.7
- Spring Security con JWT
- Spring Data MongoDB
- Maven

**Frontend:**
- HTML5, CSS3, JavaScript Vanilla
- Bootstrap 5.3.0
- Bootstrap Icons 1.11.0

**Base de Datos:**
- MongoDB Atlas (NoSQL)

### Estructura del Proyecto

```
indumanage/
├── src/
│   ├── main/
│   │   ├── java/com/indumanage/indumanage/
│   │   │   ├── config/          # Configuración (Security, JWT)
│   │   │   ├── controller/      # Controladores REST
│   │   │   ├── dto/             # Data Transfer Objects
│   │   │   ├── model/           # Entidades MongoDB
│   │   │   ├── repository/      # Repositorios MongoDB
│   │   │   ├── security/        # JWT Filter y utilidades
│   │   │   └── service/         # Lógica de negocio
│   │   └── resources/
│   │       ├── static/
│   │       │   ├── admin/       # Páginas de administrador
│   │       │   ├── operario/    # Páginas de operario
│   │       │   ├── cliente/     # 🚧 Páginas de cliente (Sprint 3)
│   │       │   ├── css/         # Estilos por módulo
│   │       │   └── js/          # JavaScript por módulo
│   │       └── application.properties
│   └── test/
├── docs/
│   ├── images/                  # Capturas de pantalla
│   └── SPRINT3-GUIDE.md        # Guía para Sprint 3
├── pom.xml
└── README.md
```

## 🗂️ Modelos de Datos

### Usuario
```javascript
{
  nombre: String,
  apellido: String,
  email: String (único),
  contrasena: String (BCrypt),
  telefono: String,
  rol: Enum [ADMIN, OPERARIO, CLIENTE],
  activo: Boolean,
  fechaCreacion: Date,
  fechaActualizacion: Date
}
```

### Producto
```javascript
{
  codigo: String (único),
  tipo: Enum [MAQUINARIA, REPUESTO],
  tipoMaquinaria: Enum [GRANDE, MEDIANA, PEQUEÑA], // solo MAQUINARIA
  nombre: String,
  descripcion: String,
  categoria: String,
  ubicacion: String,
  estado: Enum [FUNCIONANDO, MANTENIMIENTO, REVISION, BAJA], // solo MAQUINARIA
  stock: Number, // solo REPUESTO
  fechaAdquisicion: Date,
  observaciones: String,
  activo: Boolean,
  fechaCreacion: Date,
  fechaActualizacion: Date
}
```

### Ticket
```javascript
{
  productoId: String,
  productoCodigo: String,
  productoNombre: String,
  tipoReporte: Enum [FALLA_AVERIA, REQUIERE_MANTENIMIENTO, OBSERVACION_GENERAL, SOLICITUD_REVISION],
  descripcion: String,
  estado: Enum [PENDIENTE, EN_REVISION, RESUELTO, CERRADO],
  respuestaAdmin: String,
  operarioId: String,
  operarioNombre: String,
  fechaCreacion: Date,
  fechaActualizacion: Date,
  fechaRespuesta: Date
}
```

**Pendiente principal:**
- Agregar campo de **costo de alquiler por día** en el modelo Producto
- Crear dashboard de cliente
- Implementar gestión de alquileres
- Historial de equipos alquilados

## 🤝 Contribuir

### Convenciones de Código

- **Java:** CamelCase para clases, camelCase para métodos
- **JavaScript:** camelCase para funciones y variables
- **CSS:** kebab-case para clases
- **Commits:** Mensajes descriptivos en español
  - `feat: agregar función X`
  - `fix: corregir error en Y`
  - `docs: actualizar documentación`

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.


## 📞 Contacto

Para preguntas o sugerencias:
- Email: jfelipepabong@gmail.com
- GitHub: [jfelipepabong](https://github.com/jfelipepabong)

---

<div align="center">
  <p>Hecho con ❤️ para la industria</p>
  <p>© 2025 InduManage - Todos los derechos reservados</p>
</div>
