const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Definir el esquema de usuario
const usuarioSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Método para comparar contraseñas
usuarioSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// Encriptar la contraseña antes de guardarla
usuarioSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

const Usuario = mongoose.model('Usuario', usuarioSchema);

module.exports = Usuario;
