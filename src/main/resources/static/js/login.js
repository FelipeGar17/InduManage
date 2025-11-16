// API Base URL
const API_URL = 'http://localhost:8080/api';

// Elementos del DOM
const loginForm = document.getElementById('loginForm');
const registroForm = document.getElementById('registroForm');
const togglePassword = document.getElementById('togglePassword');
const togglePasswordReg = document.getElementById('togglePasswordReg');
const toggleIcon = document.getElementById('toggleIcon');
const toggleIconReg = document.getElementById('toggleIconReg');
const contrasenaInput = document.getElementById('contrasena');
const contrasenaRegInput = document.getElementById('regContrasena');
const alertError = document.getElementById('alertError');
const errorMessage = document.getElementById('errorMessage');
const btnLogin = document.getElementById('btnLogin');
const btnRegistro = document.getElementById('btnRegistro');
const cardTitle = document.getElementById('cardTitle');

// Enlaces para cambiar entre formularios
const showRegistro = document.getElementById('showRegistro');
const showLogin = document.getElementById('showLogin');

// Cambiar a formulario de registro
showRegistro.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.remove('active');
    registroForm.classList.add('active');
    cardTitle.textContent = '¡Únete a InduManage!';
    document.getElementById('cardSubtitle').textContent = 'Crea tu cuenta y accede a nuestra tienda de repuestos y servicio de alquiler de maquinaria pesada';
    alertError.classList.remove('show');
});

// Cambiar a formulario de login
showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registroForm.classList.remove('active');
    loginForm.classList.add('active');
    cardTitle.textContent = '¡Bienvenido de nuevo!';
    document.getElementById('cardSubtitle').textContent = 'Accede a tu cuenta para gestionar tus pedidos, alquileres y solicitudes de servicio';
    alertError.classList.remove('show');
});

// Toggle mostrar/ocultar contraseña - Login
togglePassword.addEventListener('click', () => {
    const type = contrasenaInput.getAttribute('type') === 'password' ? 'text' : 'password';
    contrasenaInput.setAttribute('type', type);
    
    if (type === 'text') {
        toggleIcon.classList.remove('bi-eye');
        toggleIcon.classList.add('bi-eye-slash');
    } else {
        toggleIcon.classList.remove('bi-eye-slash');
        toggleIcon.classList.add('bi-eye');
    }
});

// Toggle mostrar/ocultar contraseña - Registro
togglePasswordReg.addEventListener('click', () => {
    const type = contrasenaRegInput.getAttribute('type') === 'password' ? 'text' : 'password';
    contrasenaRegInput.setAttribute('type', type);
    
    if (type === 'text') {
        toggleIconReg.classList.remove('bi-eye');
        toggleIconReg.classList.add('bi-eye-slash');
    } else {
        toggleIconReg.classList.remove('bi-eye-slash');
        toggleIconReg.classList.add('bi-eye');
    }
});

// Mostrar error
function mostrarError(mensaje) {
    errorMessage.textContent = mensaje;
    alertError.classList.add('show');
    
    setTimeout(() => {
        alertError.classList.remove('show');
    }, 5000);
}

// Guardar token y datos de usuario
function guardarSesion(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify({
        id: data.id,
        correo: data.correo,
        nombre: data.nombre,
        apellido: data.apellido,
        rol: data.rol
    }));
}

// Redirigir según el rol
function redirigirSegunRol(rol) {
    switch(rol) {
        case 'ADMIN':
            window.location.href = '/admin/dashboard.html';
            break;
        case 'OPERARIO':
            window.location.href = '/operario/dashboard.html';
            break;
        case 'CLIENTE':
            window.location.href = '/cliente/dashboard.html';
            break;
        default:
            window.location.href = '/dashboard.html';
    }
}

// Manejo del formulario de login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const correo = document.getElementById('correo').value;
    const contrasena = document.getElementById('contrasena').value;
    
    // Deshabilitar botón mientras procesa
    btnLogin.disabled = true;
    btnLogin.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Iniciando sesión...';
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ correo, contrasena })
        });
        
        if (response.ok) {
            const data = await response.json();
            guardarSesion(data);
            
            // Mostrar mensaje de éxito
            btnLogin.innerHTML = '<i class="bi bi-check-circle me-2"></i>¡Bienvenido!';
            btnLogin.classList.remove('btn-primary');
            btnLogin.classList.add('btn-success');
            
            // Redirigir después de 1 segundo
            setTimeout(() => {
                redirigirSegunRol(data.rol);
            }, 1000);
            
        } else {
            const error = await response.text();
            mostrarError(error || 'Credenciales incorrectas');
            btnLogin.disabled = false;
            btnLogin.innerHTML = '<i class="bi bi-box-arrow-in-right me-2"></i>Iniciar Sesión';
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error de conexión con el servidor');
        btnLogin.disabled = false;
        btnLogin.innerHTML = '<i class="bi bi-box-arrow-in-right me-2"></i>Iniciar Sesión';
    }
});

// Manejo del formulario de registro
registroForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const datosRegistro = {
        correo: document.getElementById('regCorreo').value,
        contrasena: document.getElementById('regContrasena').value,
        nombre: document.getElementById('regNombre').value,
        apellido: document.getElementById('regApellido').value,
        telefono: document.getElementById('regTelefono').value
    };
    
    // Deshabilitar botón mientras procesa
    btnRegistro.disabled = true;
    btnRegistro.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Registrando...';
    
    try {
        const response = await fetch(`${API_URL}/auth/registro`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosRegistro)
        });
        
        if (response.ok) {
            const data = await response.json();
            guardarSesion(data);
            
            // Mostrar mensaje de éxito
            btnRegistro.innerHTML = '<i class="bi bi-check-circle me-2"></i>¡Registro exitoso!';
            btnRegistro.classList.remove('btn-primary');
            btnRegistro.classList.add('btn-success');
            
            // Redirigir después de 1 segundo
            setTimeout(() => {
                redirigirSegunRol(data.rol);
            }, 1000);
            
        } else {
            const error = await response.text();
            mostrarError(error || 'Error en el registro');
            btnRegistro.disabled = false;
            btnRegistro.innerHTML = '<i class="bi bi-person-plus me-2"></i>Registrarse';
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error de conexión con el servidor');
        btnRegistro.disabled = false;
        btnRegistro.innerHTML = '<i class="bi bi-person-plus me-2"></i>Registrarse';
    }
});

// Verificar si ya hay sesión activa
window.addEventListener('load', () => {
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    
    if (token && usuario) {
        // Ya hay sesión activa, redirigir
        redirigirSegunRol(usuario.rol);
    }
});
