const socket = io('http://localhost:3000');

// Elementos del DOM
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const messageForm = document.getElementById('send-container');
const messageInput = document.getElementById('message-input');
const messageContainer = document.getElementById('message-container');
const authContainer = document.getElementById('auth-container');
const chatContainer = document.getElementById('chat-container');
const cerrarSesionBtt = document.querySelector('.cerrar-sesion-btt');


let username = '';  // Variable para guardar el nombre de usuario

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
        const data = await response.json();  // Obtener el nombre de usuario desde la respuesta
        username = data.username;  // Guardar el nombre de usuario
        alert('Inicio de sesión exitoso');
        authContainer.style.display = 'none';
        chatContainer.style.display = 'block';
    } else {
        alert('Error al iniciar sesión');
    }
});


// Registro
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    const response = await fetch('/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `username=${username}&password=${password}`,
    });

    if (response.ok) {
        alert('Registro exitoso');
    } else {
        alert('Error al registrarse');
    }
});

// Enviar mensaje
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const mensaje = messageInput.value;
    socket.emit('send-chat-message', { mensaje, username });  // Emitir solo al servidor
    messageInput.value = '';  // Limpiar el campo de texto
});

// Recibir mensaje
socket.on('chat-message', (data) => {
    appendMessage(`${data.username}: ${data.mensaje}`);  // Mostrar el nombre de usuario junto con el mensaje
});

// Mostrar mensaje en el chat
function appendMessage(mensaje) {
    const messageElement = document.createElement('div');
    messageElement.innerText = mensaje;
    messageContainer.appendChild(messageElement);
}


cerrarSesionBtt.addEventListener('click', () => {
    // Emitir un evento para cerrar sesión en el servidor usando socket.io
    socket.emit('logout', username);

    // Restablecer el nombre de usuario
    username = '';

    // Mostrar la pantalla de autenticación y ocultar el chat
    authContainer.style.display = 'block';
    chatContainer.style.display = 'none';

    alert('Sesión cerrada');
});
