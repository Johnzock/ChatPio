const mongoose = require('mongoose');

const grupoSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    miembros: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }]
});

const Grupo = mongoose.model('Grupo', grupoSchema);

module.exports = Grupo;
