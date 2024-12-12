const express = require('express');
const mongoose = require('mongoose');
const Usuario = require('./models/usuario');
const Grupo = require('./models/grupo');
const socketIo = require('socket.io');

const app = express();
const server = app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});
const io = socketIo(server);

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/chatapp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Conectado a la base de datos'))
  .catch(err => console.log(err));

// Middleware para parsear datos de formularios
app.use(express.urlencoded({ extended: true }));
app.use(express.json());  // Para manejar JSON

// Middleware para servir archivos estáticos (HTML, CSS, JS)
app.use(express.static('public'));

// Ruta para el registro
app.post('/registro', async (req, res) => {
    const { username, password } = req.body;
    const usuarioExistente = await Usuario.findOne({ username });
    if (usuarioExistente) {
        return res.status(400).send('Usuario ya registrado');
    }
    const nuevoUsuario = new Usuario({ username, password });
    await nuevoUsuario.save();
    res.send('Registro exitoso');
});

// Ruta para el login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const usuario = await Usuario.findOne({ username });
    if (!usuario) {
        return res.status(400).send('Usuario no encontrado');
    }
    const esValido = await usuario.comparePassword(password);
    if (!esValido) {
        return res.status(400).send('Contraseña incorrecta');
    }
    res.json({ username: usuario.username });
});

// Ruta para crear un grupo
app.post('/crear-grupo', async (req, res) => {
    const { nombre } = req.body;
    const grupoExistente = await Grupo.findOne({ nombre });
    if (grupoExistente) {
        return res.status(400).send('El grupo ya existe');
    }
    const nuevoGrupo = new Grupo({ nombre });
    await nuevoGrupo.save();
    res.status(201).json(nuevoGrupo);
});

// Ruta para obtener todos los grupos
app.get('/grupos', async (req, res) => {
    const grupos = await Grupo.find();
    res.json(grupos);
});

// Ruta para unirse a un grupo
app.post('/unirse-grupo', async (req, res) => {
    const { username, nombreGrupo } = req.body;
    const usuario = await Usuario.findOne({ username });
    if (!usuario) {
        return res.status(400).send('Usuario no encontrado');
    }
    const grupo = await Grupo.findOne({ nombre: nombreGrupo });
    if (!grupo) {
        return res.status(400).send('Grupo no encontrado');
    }
    grupo.miembros.push(usuario._id);
    await grupo.save();
    res.status(200).send('Te has unido al grupo');
});

// Conectar con Socket.IO
let usuariosConectados = {};  // Almacenar los usuarios conectados y sus grupos

io.on('connection', (socket) => {
    console.log('Nuevo usuario conectado');

    socket.on('join-group', (data) => {
        const { username, groupName } = data;
        if (!usuariosConectados[username]) {
            usuariosConectados[username] = [];
        }
        usuariosConectados[username].push(groupName);
        socket.join(groupName);  // Unir al socket al grupo
        console.log(`${username} se unió al grupo ${groupName}`);
    });

    socket.on('send-chat-message', (data) => {
        const { mensaje, username, groupName } = data;
        // Verificar que el usuario está en el grupo antes de enviar el mensaje
        if (usuariosConectados[username]?.includes(groupName)) {
            io.to(groupName).emit('chat-message', { mensaje, username, groupName });
        }
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
        for (const username in usuariosConectados) {
            usuariosConectados[username] = usuariosConectados[username].filter(
                (groupName) => socket.rooms.has(groupName)
            );
        }
    });
});

app.get('/usuarios', async (req, res) => {
    try {
        const usuarios = await Usuario.find();  // Obtener todos los usuarios registrados
        res.json(usuarios);  // Responder con los usuarios en formato JSON
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los usuarios' });
    }
});

