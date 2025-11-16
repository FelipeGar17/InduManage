# 🧪 Guía de Pruebas - InduManage API

## 🔐 ¿Qué es JWT?

**JWT (JSON Web Token)** es un token de seguridad que:
- Se genera cuando haces login
- Contiene información codificada (correo, rol, expiración)
- Se envía en cada petición para autenticarte
- El servidor lo valida sin consultar la base de datos

---

## 📝 Pruebas con Postman/Thunder Client

### 1️⃣ **LOGIN - Obtener Token**

**POST** `http://localhost:8080/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "correo": "admin@indumanage.com",
  "contrasena": "admin123"
}
```

**Respuesta exitosa (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJyb2wiOiJBRE1JTiIsInN1YiI6ImFkbWluQGluZHVtYW5hZ2UuY29tIiwiaWF0IjoxNjk5NDc...",
  "tipo": "Bearer",
  "id": "654a1b2c3d4e5f6g7h8i9j0k",
  "correo": "admin@indumanage.com",
  "nombre": "Administrador",
  "apellido": "Sistema",
  "rol": "ADMIN"
}
```

**⚠️ IMPORTANTE:** Copia el valor de `token` (el texto largo), lo necesitarás para las siguientes peticiones.

---

### 2️⃣ **REGISTRO de Cliente**

**POST** `http://localhost:8080/api/auth/registro`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "correo": "juan.perez@ejemplo.com",
  "contrasena": "password123",
  "nombre": "Juan",
  "apellido": "Pérez",
  "telefono": "3001234567"
}
```

**Respuesta exitosa (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "tipo": "Bearer",
  "id": "654a1b2c3d4e5f6g7h8i9j0k",
  "correo": "juan.perez@ejemplo.com",
  "nombre": "Juan",
  "apellido": "Pérez",
  "rol": "CLIENTE"
}
```

---

### 3️⃣ **Usar el TOKEN JWT en peticiones protegidas**

Para probar que el JWT funciona, intenta acceder a un endpoint protegido:

#### Sin TOKEN (devolverá 401 Unauthorized):

**GET** `http://localhost:8080/api/admin/dashboard`

**Headers:**
```
(ninguno)
```

**Resultado:** ❌ Error 401 o 403 (no autenticado)

---

#### Con TOKEN (devolverá la información):

**GET** `http://localhost:8080/api/admin/dashboard`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJyb2wiOiJBRE1JTiIsInN1YiI6ImFkbWluQGluZHVtYW5hZ2UuY29tIiwiaWF0IjoxNjk5NDc...
```

**⚠️ IMPORTANTE:** 
- Pon `Bearer` (espacio) y luego el token que copiaste del login
- El token expira en 24 horas (86400000 ms)

---

## 🌐 Prueba desde el navegador

1. **Abre:** http://localhost:8080
2. **Haz login** con un usuario
3. **Abre DevTools (F12)**
4. Ve a **Application** → **Local Storage** → `http://localhost:8080`
5. Verás el `token` guardado allí

### Decodificar el JWT (ver qué contiene):

Ve a: https://jwt.io

Pega tu token en el campo **"Encoded"** y verás:

**HEADER:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**PAYLOAD (información codificada):**
```json
{
  "rol": "ADMIN",
  "sub": "admin@indumanage.com",
  "iat": 1699472400,
  "exp": 1699558800
}
```

**SIGNATURE:** Verificación de seguridad (solo el servidor puede validarla)

---

## ✅ Cómo saber que JWT funciona correctamente:

1. ✅ **Login exitoso** devuelve un `token`
2. ✅ El token se guarda en `localStorage` (navegador)
3. ✅ Las peticiones a endpoints protegidos incluyen el token en el header
4. ✅ El servidor valida el token y permite/deniega acceso según el rol
5. ✅ Al cerrar sesión, se elimina el token

---

## 🎯 Usuarios de Prueba

| Rol | Correo | Contraseña | Dashboard |
|-----|--------|------------|-----------|
| ADMIN | admin@indumanage.com | admin123 | /dashboard-admin.html |
| OPERARIO | operario@indumanage.com | operario123 | /dashboard-admin.html |
| CLIENTE | (registra uno nuevo) | (tu elección) | /dashboard-cliente.html |

---

## 🔒 Seguridad del JWT

- ✅ El token está **firmado** con tu clave secreta
- ✅ Nadie puede modificarlo sin conocer la clave
- ✅ Si alguien lo roba, puede usarlo hasta que expire (24 horas)
- ✅ Por eso es importante usar HTTPS en producción
- ✅ El token contiene el **rol del usuario**, así se verifica el acceso

---

## 📌 Próximos pasos:

En el **Sprint 2** agregaremos endpoints protegidos reales como:
- `/api/admin/usuarios` (listar usuarios)
- `/api/operario/inventario` (gestión de inventario)
- `/api/cliente/pedidos` (pedidos del cliente)

Y todos usarán JWT para verificar que estás autenticado y autorizado! 🚀
