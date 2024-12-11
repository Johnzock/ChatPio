const mongoose = require('mongoose');

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/chatapp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Conectado a la base de datos')).catch(err => console.log(err));
