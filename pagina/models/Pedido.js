const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
  nombre:      { type: String, required: true, trim: true },
  correo:      { type: String, required: true, trim: true, lowercase: true },
  telefono:    { type: String, required: true, trim: true },
  direccion:   { type: String, required: true, trim: true },
  tamano:      { type: String, required: true, enum: ['mini', 'pequeno', 'mediano', 'grande'] },
  descripcion: { type: String, default: '', trim: true, maxlength: 500 },
  foto:        { type: String, required: true },   //nombre del archivo guardado
  total:       { type: Number, required: true },
  codigo:      { type: String, required: true },   //codigo de seguimiento
  estado: {
    type: String,
    enum: ['En espera', 'En proceso', 'Entregado'],
    default: 'En espera'
  }
}, { timestamps: true });

module.exports = mongoose.model('Pedido', pedidoSchema);