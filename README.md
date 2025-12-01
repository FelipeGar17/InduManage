# 🏭 InduManage

<div align="center">

**Sistema de Gestión Industrial con Tienda Online y Alquiler de Maquinaria**

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.7-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/)
[![Railway](https://img.shields.io/badge/Deploy-Railway-blueviolet.svg)](https://railway.app)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

### 🌐 [Ver Demo en Vivo](https://indumanage-production.up.railway.app/)

[Características](#-características) • [Demo](#-demo) • [Tecnologías](#-stack-tecnológico) • [Uso](#-usuarios-de-prueba)

</div>

---

## 📋 Descripción

**InduManage** es una plataforma web completa para la gestión industrial que integra:
- 🛒 **Tienda Online** de repuestos industriales
- 🏗️ **Sistema de Alquiler** de maquinaria pesada (diario, semanal, mensual)
- 📦 **Control de Inventario** inteligente
- 🎫 **Sistema de Tickets** para reportes de mantenimiento
- 👥 **Gestión de Usuarios** con 3 roles (Admin, Operario, Cliente)

Ideal para empresas industriales que necesitan digitalizar sus operaciones de venta, alquiler y mantenimiento de equipos.

## 🌟 Demo

**🔗 Aplicación en Vivo:** [https://indumanage-production.up.railway.app/](https://indumanage-production.up.railway.app/)

## ✨ Características Principales

### 🛒 Tienda Online de Repuestos
- Catálogo completo con imágenes y precios
- Carrito de compras funcional
- Filtros por categoría y búsqueda
- Sistema de órdenes de compra/alquiler
- Estados: Pendiente, Aprobada, Rechazada, En Proceso, Completada

### 🏗️ Sistema de Alquiler de Maquinaria
- Tarifas diferenciadas: **día, semana, mes**
- Disponibilidad en tiempo real
- Gestión de alquileres activos
- Historial completo por cliente

### 📦 Gestión de Inventario
- Control de **Maquinaria** (Grande, Mediana, Pequeña) y **Repuestos**
- Stock mínimo y alertas
- Disponibilidad para venta/alquiler
- Estados: Funcionando, Mantenimiento, Revisión, Baja
- Autocompletado inteligente

### 🎫 Sistema de Tickets
- Reportes de mantenimiento por operarios
- Gestión y seguimiento por administradores
- Estados: Pendiente → En Revisión → Resuelto → Cerrado
- Historial completo con respuestas

### 🔐 Seguridad
- Autenticación JWT (tokens 24h)
- Encriptación BCrypt
- 3 roles con permisos diferenciados
- CORS configurado para producción
## 🖼️ Capturas de Pantalla

<div align="center">

### 🔐 Login y Registro
<img src="docs/images/login.png" alt="Login" width="600"/>

### 👤 Dashboard Administrador
<img src="docs/images/admin-dashboard.jpg" alt="Dashboard Admin" width="600"/>
<p><em>Gestión completa de usuarios, productos y órdenes</em></p>

### 🛒 Tienda Online (Cliente)
<img src="docs/images/tienda.jpg" alt="Tienda" width="600"/>
<p><em>Catálogo de repuestos con carrito y sistema de órdenes</em></p>

### 🏭 Dashboard Operario
<img src="docs/images/operario-dashboard.jpg" alt="Dashboard Operario" width="600"/>
<p><em>Reportes de mantenimiento y gestión de tickets</em></p>

</div>em>Vista de operario para reportar problemas en equipos</em></p>
</div>


## 🚀 Instalación

### Requisitos Previos
## 👥 Usuarios de Prueba

Accede con estas credenciales en la [demo en vivo](https://indumanage-production.up.railway.app/):

| Rol | Email | Contraseña | Permisos |
|-----|-------|------------|----------|
| **ADMIN** | admin@indumanage.com | admin123 | Gestión completa del sistema |
| **OPERARIO** | operario@indumanage.com | operario123 | Ver inventario y crear tickets |
| **CLIENTE** | Crea tu cuenta | - | Tienda, carrito y alquileres |

## 🚀 Instalación Local

### Requisitos
- Java 21+
- Maven 3.8+
- MongoDB Atlas o local

### Pasos Rápidos

```bash
# 1. Clonar repositorio
git clone https://github.com/FelipeGar17/InduManage.git
cd indumanage

# 2. Configurar MongoDB (editar application.properties)
spring.data.mongodb.uri=mongodb+srv://user:pass@cluster.mongodb.net/indumanage

# 3. Configurar JWT Secret (editar application.properties)
jwt.secret=TuClaveSecretaSuperSegura

# 4. Compilar y ejecutar
mvn clean install
mvn spring-boot:run

# 5. Abrir navegador
http://localhost:8080
```

### Despliegue en Railway

1. Fork este repositorio
2. Conecta tu cuenta de Railway con GitHub
3. Crea nuevo proyecto desde tu repositorio
4. Agrega variables de entorno:
   - `MONGODB_URI`: Tu conexión MongoDB Atlas
   - `JWT_SECRET`: Clave secreta para JWT
   - `PORT`: Asignado automáticamente por Railway
5. Railway construirá y desplegará automáticamente
### Roles y Permisos

| Rol | Permisos |
|-----|----------|
| **ADMIN** | Acceso completo: gestión de usuarios, productos, tickets, reportes |
| **OPERARIO** | Ver productos activos, crear tickets, ver sus propios tickets |
| **CLIENTE** | 🚧 En desarrollo (Sprint 3) |

### Flujo de Trabajo

1. **Login** → El sistema redirige automáticamente según el rol
## 📖 Guía de Uso

### Flujo por Rol

#### 👨‍💼 Administrador
1. Gestionar usuarios (crear, editar, activar/desactivar)
2. Gestionar inventario (productos, maquinaria, stock, precios)
3. Revisar y aprobar/rechazar órdenes de clientes
4. Responder tickets de operarios
5. Ver estadísticas generales

#### 👷 Operario
1. Ver inventario de productos activos
2. Crear tickets de mantenimiento
3. Ver historial de sus reportes
4. Consultar maquinaria disponible

#### 🛒 Cliente
1. Registrarse en la plataforma
2. Explorar catálogo de repuestos y maquinaria
3. Agregar productos al carrito
4. Seleccionar tipo de orden (Compra/Alquiler) y período
5. Realizar órdenes de compra/alquiler
6. Ver historial y estado de órdenes

### Flujo de Órdenes

```
Cliente crea orden → PENDIENTE
       ↓
Admin revisa → APROBADA o RECHAZADA
       ↓
Si aprobada → EN_PROCESO
       ↓
Entrega/Devolución → COMPLETADA
```
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
## 🗂️ Modelos Principales

### Producto
```javascript
{
  codigo: String,
  tipo: "MAQUINARIA" | "REPUESTO",
  nombre: String,
  descripcion: String,
  categoria: String,
  
  // Precios (nuevos en Sprint 3)
  precio: Number,                    // Precio de venta
  precioAlquilerDia: Number,        // Tarifa diaria
  precioAlquilerSemana: Number,     // Tarifa semanal
  precioAlquilerMes: Number,        // Tarifa mensual
  
  disponibleVenta: Boolean,
  stock: Number,
  stockMinimo: Number,
  imagenUrl: String,
  estado: "FUNCIONANDO" | "MANTENIMIENTO" | "REVISION" | "BAJA"
}
```

### Orden (Nuevo en Sprint 3)
```javascript
{
  clienteId: String,
  clienteNombre: String,
  clienteEmail: String,
  
  items: [{
    productoId: String,
    nombre: String,
    tipo: "MAQUINARIA" | "REPUESTO",
    cantidad: Number,
    precioUnitario: Number,
    subtotal: Number
  }],
  
  tipoOrden: "COMPRA" | "ALQUILER",
  periodoAlquiler: "DIA" | "SEMANA" | "MES",  // solo alquiler
  
  estado: "PENDIENTE" | "APROBADA" | "RECHAZADA" | "EN_PROCESO" | "COMPLETADA",
  
  montoTotal: Number,
  fechaInicio: Date,
## 🛠️ Stack Tecnológico

**Backend**
- Spring Boot 3.5.7
- Spring Security + JWT
- Spring Data MongoDB
- Maven

**Frontend**
- HTML5, CSS3, JavaScript (Vanilla)
- Bootstrap 5.3.0
- Bootstrap Icons 1.11.0

**Base de Datos**
- MongoDB Atlas (NoSQL)

**Despliegue**
- Railway (Backend + Frontend)
- GitHub (Control de versiones)

## 🗺️ Roadmap

### ✅ Completado
- [x] Sprint 1: Autenticación JWT y roles
- [x] Sprint 2: Gestión de usuarios, inventario y tickets
- [x] Sprint 3: Tienda online y sistema de alquiler

### 🚧 Próximas Mejoras
- [ ] Sistema de pagos (Stripe/PayPal)
- [ ] Notificaciones por email
- [ ] Dashboard con gráficas (Chart.js)
- [ ] Exportar reportes a PDF/Excel
- [ ] App móvil (React Native)
- [ ] Chat en tiempo real (WebSockets)

## 📝 Licencia

Distribuido bajo la Licencia MIT. Ver `LICENSE` para más información.

## 📞 Contacto

**Felipe García** - Desarrollador Full Stack

- 📧 Email: jfelipepabong@gmail.com
- 💼 GitHub: [@FelipeGar17](https://github.com/FelipeGar17)
- 🌐 Demo: [indumanage-production.up.railway.app](https://indumanage-production.up.railway.app/)

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
