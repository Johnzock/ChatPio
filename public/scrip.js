const socket = io('http://localhost:3000');

// Elementos del DOM
const messageForm = document.getElementById('send-container');
const messageInput = document.getElementById('message-input');
const messageContainer = document.getElementById('message-container');
const chatContainer = document.getElementById('chat-container');
const selectGrupo = document.getElementById('select-grupo');
const unirseGrupoBtt = document.querySelector('.unirse-grupo-btt');
const crearGrupoBtt = document.querySelector('.crear-grupo-btt');


let username = '';  // Variable para guardar el nombre de usuario
let currentGroup = '';  // Almacenar el grupo actual en el que el usuario está


// Cargar grupos
async function cargarGrupos() {
    const response = await fetch('/grupos');
    const grupos = await response.json();
    selectGrupo.innerHTML = '<option value="">Selecciona un Grupo</option>';
    grupos.forEach(grupo => {
        const option = document.createElement('option');
        option.value = grupo.nombre;
        option.textContent = grupo.nombre;
        selectGrupo.appendChild(option);
    });
}

// Unirse a un grupo
unirseGrupoBtt.addEventListener('click', async () => {
    const groupName = selectGrupo.value;
    if (groupName) {
        const response = await fetch('/unirse-grupo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, nombreGrupo: groupName }),
        });

        if (response.ok) {
            alert(`Te has unido al grupo: ${groupName}`);
            currentGroup = groupName;
            socket.emit('join-group', { username, groupName });  // Unirse al grupo en Socket.IO

            // Limpiar los mensajes anteriores
            messageContainer.innerHTML = '';  // Limpiar los mensajes previos
            chatContainer.style.display = 'block';
        } else {
            alert('Error al unirse al grupo');
        }
    }
});

// Enviar mensaje
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const mensaje = messageInput.value;
    if (currentGroup) {
        socket.emit('send-chat-message', { mensaje, username, groupName: currentGroup });
    }
    messageInput.value = '';
});

// Recibir mensaje
socket.on('chat-message', (data) => {
    if (data.groupName === currentGroup) {
        appendMessage(`${data.username}: ${data.mensaje}`);
    }
});

function appendMessage(mensaje) {
    const messageElement = document.createElement('div');
    messageElement.innerText = mensaje;
    messageContainer.appendChild(messageElement);
}

// Crear grupo
crearGrupoBtt.addEventListener('click', async () => {
    const groupName = prompt("Ingresa el nombre del nuevo grupo:");

    if (groupName) {
        // Enviar solicitud al servidor para crear el grupo
        const response = await fetch('/crear-grupo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: groupName }),
        });

        if (response.ok) {
            alert('Grupo creado exitosamente');
            cargarGrupos();  // Recargar los grupos
        } else {
            alert('Error al crear el grupo');
        }
    }
});

// Cargar usuarios registrados
// Cargar usuarios registrados (ya tienes este código)
async function cargarUsuarios() {
    const response = await fetch('/usuarios');
    const usuarios = await response.json();

    // Filtrar el usuario actual
    const usuariosFiltrados = usuarios
        .filter(usuario => usuario.username !== username)  // Filtrar por nombre de usuario
        .map(usuario => usuario.username);  // Extraer solo los nombres de usuario

    // Mostrar los usuarios en el select
    const selectUsuario = document.getElementById('select-usuario');
    selectUsuario.innerHTML = '<option value="">Selecciona un usuario</option>';

    usuariosFiltrados.forEach(usuario => {
        const option = document.createElement('option');
        option.value = usuario;  // Valor del <option> es el nombre de usuario
        option.textContent = usuario;  // Texto que se muestra es el nombre de usuario
        selectUsuario.appendChild(option);
    });
}


