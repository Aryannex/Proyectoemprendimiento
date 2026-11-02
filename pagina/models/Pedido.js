const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  correo: { type: String, required: true },
  telefono: { type: String, required: true },
  direccion: { type: String, required: true },
  total: { type: String, required: true },
  estado: { 
    type: String, 
    enum: ['En espera', 'En proceso', 'Entregado'],
    default: 'En espera'
  },
 }, { timestamps: true });

module.exports = mongoose.model('Pedido', pedidoSchema);