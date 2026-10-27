const express = require('express');
const router = express.Router();
const Pedido = require('./models/Pedido');

// Nuevo pedido desde el formulario principal, cliente
router.post('/', async (req, res) => {
  try {
    const nuevoPedido = new Pedido(req.body);
    await nuevoPedido.save();
    res.status(201).json({ success: true, message: 'Pedido agendado correctamente', pedido: nuevoPedido });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al agendar el pedido', error: error.message });
  }
});

// Obtener todos los pedidos, panel admin
router.get('/', async (req, res) => {
  try {
    const pedidos = await Pedido.find().sort({ fecha: -1 });
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener los pedidos' });
  }
});

// Obtener pedidos filtrados por correo, panel cliente
router.get('/cliente/:correo', async (req, res) => {
  try {
    const correo = req.params.correo.toLowerCase();
    const pedidos = await Pedido.find({ correo: { $regex: new RegExp('^' + correo + '$', 'i') } });
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al buscar los pedidos del cliente' });
  }
});

// Cambiar el estado de un pedido, panel admin (En espera, En proceso, Entregado)
router.put('/:id/estado', async (req, res) => {
  try {
    const { estado } = req.body;
    const pedidoActualizado = await Pedido.findByIdAndUpdate(
      req.params.id, 
      { estado }, 
      { new: true }
    );
    res.json({ success: true, message: 'Estado actualizado', pedido: pedidoActualizado });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar el estado' });
  }
});

module.exports = router;