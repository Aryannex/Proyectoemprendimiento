const express = require('express');
const router = express.Router();
const Pedido = require('../models/Pedido');

// Ver todos, panel admin)
router.get('/', async (req, res) => {
  try {
    res.json(await Pedido.find().sort({ createdAt: -1 }));
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Pedidos de un cliente
router.get('/cliente/:correo', async (req, res) => {
  try {
    const correo = req.params.correo.trim().toLowerCase();
    res.json(await Pedido.find({ correo }));
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Crear pedido
router.post('/', async (req, res) => {
  try {
    const pedido = await Pedido.create(req.body);
    res.status(201).json({ success: true, pedido });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
});

// Cambiar estado
router.put('/:id/estado', async (req, res) => {
  try {
    const pedido = await Pedido.findByIdAndUpdate(
      req.params.id,
      { estado: req.body.estado },
      { new: true, runValidators: true }
    );
    if (!pedido) return res.status(404).json({ success: false });
    res.json({ success: true, pedido });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
});

module.exports = router;