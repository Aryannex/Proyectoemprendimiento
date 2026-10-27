const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  correo: { type: String, required: true },
  telefono: { type: String, required: true },
  direccion: { type: String, required: true },
  total: { type: String, required: true },
  estado: { type: String, default: 'En espera' },
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pedido', pedidoSchema);