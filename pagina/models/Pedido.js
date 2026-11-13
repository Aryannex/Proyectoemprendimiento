const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
  nombre:      { type: String, required: true, trim: true },
  correo:      { type: String, required: true, trim: true, lowercase: true },
  telefono:    { type: String, required: true, trim: true },
  direccion:   { type: String, required: true, trim: true },
  tamano:      { type: String, required: true, enum: ['mini', 'pequeno', 'mediano', 'grande'] },
  descripcion: { type: String, default: '', trim: true, maxlength: 500 },
  fotoData:    { type: Buffer, required: true, select: false },
  fotoTipo:    { type: String, required: true },
  total:       { type: Number, required: true },
  estado: {
    type: String,
    enum: ['En espera', 'En proceso', 'Entregado'],
    default: 'En espera'
  }
}, { timestamps: true });

module.exports = mongoose.model('Pedido', pedidoSchema);