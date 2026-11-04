const express = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Máximo 10 intentos cada 15 minutos
const limitador = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { success: false, error: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' }
});

router.post('/login', limitador, (req, res) => {
  const { usuario, clave } = req.body;

  if (usuario === process.env.ADMIN_USER && clave === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ rol: 'admin' }, process.env.JWT_SECRET, { expiresIn: '8h' });
    return res.json({ success: true, token });
  }

  res.status(401).json({ success: false, error: 'Usuario o contraseña incorrectos.' });
});

module.exports = router;