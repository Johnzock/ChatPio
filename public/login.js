const socket = io('http://localhost:3000');

// Elementos del DOM para Login
const loginForm = document.getElementById('login-form');
const authContainer = document.getElementById('auth-container');
const chatContainer = document.getElementById('chat-container');
let username = ''; // Variable para guardar el nombre de usuario

// Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const loginUsername = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `username=${loginUsername}&password=${password}`,
    });

    if (response.ok) {
        const data = await response.json();
        username = data.username;
        alert('Inicio de sesión exitoso');
        authContainer.style.display = 'none';
        chatContainer.style.display = 'block';
    } else {
        alert('Error al iniciar sesión');
    }
});

// Cerrar sesión
const cerrarSesionBtt = document.querySelector('.cerrar-sesion-btt');
cerrarSesionBtt.addEventListener('click', () => {
    socket.emit('logout', username);
    username = '';
    authContainer.style.display = 'block';
    chatContainer.style.display = 'none';
    alert('Sesión cerrada');
});
