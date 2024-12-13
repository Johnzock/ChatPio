const socket = io('http://localhost:3000');

// Elementos del DOM para Registro
const registerForm = document.getElementById('register-form');
const authContainer = document.getElementById('auth-container');
const chatContainer = document.getElementById('chat-container');
let username = ''; // Variable para guardar el nombre de usuari

// Registro
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const registerUsername = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    const response = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `username=${registerUsername}&password=${password}`,
    });

    if (response.ok) {
        const data = await response.json();
        username = data.username;
        alert('Registro exitoso. Ahora puedes iniciar sesión.');
        window.location.href = 'login.html'; // Redirigir al login
    } else {
        alert('Error al registrarse');
    }
});
