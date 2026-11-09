const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const Pedido = require('../models/Pedido');
const verificarAdmin = require('../middleware/verificarAdmin');

const router = express.Router();

// Los precios quedan en el servidor, no pueden ser modificados en la web
const PRECIOS = { mini: 35000, pequeno: 50000, mediano: 130000, grande: 180000 };
const PRECIO_ENVIO = 20000;

// tipo de archivo permitido en imagenes
const EXTENSIONES = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, '..', 'uploads'),
    // genera un nombre random para la foto, tipo una ID
    filename: (req, file, cb) =>
      cb(null, crypto.randomBytes(16).toString('hex') + EXTENSIONES[file.mimetype])
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) =>
    EXTENSIONES[file.mimetype]
      ? cb(null, true)
      : cb(new Error('Solo se permiten imágenes JPG, PNG o WEBP.'))
});

const limitarConsultas = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: { success: false, error: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' }
});

// Crear pedido 
router.post('/', (req, res) => {
  upload.single('foto')(req, res, async (error) => {
    if (error) return res.status(400).json({ success: false, error: error.message });

    const borrarFoto = () => req.file && fs.unlink(req.file.path, () => {});

    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'Falta la foto.' });
      }

      const { nombre, correo, telefono, direccion, tamano, descripcion } = req.body;

      if (!Object.hasOwn(PRECIOS, tamano)) {
        borrarFoto();
        return res.status(400).json({ success: false, error: 'Tamaño no válido.' });
      }

    
  await Pedido.create({
  nombre, correo, telefono, direccion, tamano, descripcion,
  foto: req.file.filename,
  total: PRECIOS[tamano] + PRECIO_ENVIO
});

res.status(201).json({ success: true });
    } catch (e) {
      borrarFoto();
      res.status(400).json({ success: false, error: e.message });
    }
  });
});

// Clientes; ven sus pedidos por el correo, pero sin los datos sensibles
router.post('/mis-pedidos', limitarConsultas, async (req, res) => {
  try {
    const correo = String(req.body.correo || '').trim().toLowerCase();

    const pedidos = await Pedido.find({ correo })
      .select('tamano total estado createdAt') 
      .sort({ createdAt: -1 });

    if (pedidos.length === 0) {
      return res.status(404).json({ success: false, error: 'No encontramos pedidos con este correo.' });
    }
    res.json({ success: true, pedidos });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Error del servidor.' });
  }
});
// admin
router.get('/', verificarAdmin, async (req, res) => {
  try {
    res.json(await Pedido.find().sort({ createdAt: -1 }));
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.put('/:id/estado', verificarAdmin, async (req, res) => {
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