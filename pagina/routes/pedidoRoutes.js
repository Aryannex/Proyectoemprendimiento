const express = require('express');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const Pedido = require('../models/Pedido');
const verificarAdmin = require('../middleware/verificarAdmin');

const router = express.Router();

// Los precios viven en el SERVIDOR: el navegador no puede cambiarlos
const PRECIOS = { mini: 35000, pequeno: 50000, mediano: 130000, grande: 180000 };
const PRECIO_ENVIO = 20000;

// La foto se recibe en memoria, máximo 4 MB.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 }
});

// confirmacion de si es una imagen o no
function detectarTipo(b) {
  if (b.length > 12) {
    if (b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF) return 'image/jpeg';
    if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47) return 'image/png';
    if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  }
  return null;
}

// consultas de clientes, limite de 20 cada 15 min
const limitarConsultas = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: { success: false, error: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' }
});

// crear pedido con su respectiva foto
router.post('/', (req, res) => {
  upload.single('foto')(req, res, async (error) => {
    if (error) {
      const mensaje = error.code === 'LIMIT_FILE_SIZE'
        ? 'La foto pesa más de 4 MB. Elige una más liviana.'
        : error.message;
      return res.status(400).json({ success: false, error: mensaje });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'Falta la foto.' });
      }

      const tipo = detectarTipo(req.file.buffer);
      if (!tipo) {
        return res.status(400).json({ success: false, error: 'La foto debe ser JPG, PNG o WEBP.' });
      }

      const { nombre, correo, telefono, direccion, tamano, descripcion } = req.body;

      if (!Object.hasOwn(PRECIOS, tamano)) {
        return res.status(400).json({ success: false, error: 'Tamaño no válido.' });
      }

      await Pedido.create({
        nombre, correo, telefono, direccion, tamano, descripcion,
        fotoData: req.file.buffer,
        fotoTipo: tipo,
        total: PRECIOS[tamano] + PRECIO_ENVIO
      });

      res.status(201).json({ success: true });
    } catch (e) {
      res.status(400).json({ success: false, error: e.message });
    }
  });
});

// los clientes ven sus pedidos con el correo, sin datos sensibles
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

// administrado
router.get('/', verificarAdmin, async (req, res) => {
  try {
    res.json(await Pedido.find().sort({ createdAt: -1 }));
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Foto de un pedido
router.get('/:id/foto', verificarAdmin, async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id).select('+fotoData fotoTipo');
    if (!pedido || !pedido.fotoData) {
      return res.status(404).json({ success: false, error: 'Sin foto.' });
    }
    res.set('Content-Type', pedido.fotoTipo);
    res.set('X-Content-Type-Options', 'nosniff');
    res.send(pedido.fotoData);
  } catch (e) {
    res.status(400).json({ success: false, error: 'Pedido no válido.' });
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