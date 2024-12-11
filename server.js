const express = require('express');
const mongoose = require('mongoose');
const Usuario = require('./models/usuario');
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

    // Enviar el nombre de usuario en la respuesta
    res.json({ username: usuario.username });
});


// Conectar con Socket.IO
io.on('connection', (socket) => {
    console.log('Nuevo usuario conectado');

    socket.on('send-chat-message', (data) => {
        // Aquí enviamos el mensaje junto con el nombre de usuario
        io.emit('chat-message', { mensaje: data.mensaje, username: data.username });
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });
});

