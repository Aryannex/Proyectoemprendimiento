const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// carpeta para fotos de los clientes
try {
  fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });
} catch (error) {
  console.log('Aviso: No se pudo crear la carpeta uploads (esto es normal en Vercel).');
}

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos del frontend 
   app.use(express.static(path.join(__dirname, 'public'))); 
   app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas del API 
app.use('/api/pedidos', require('./routes/pedidoRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

const mongoUri = process.env.MONGODB_URI;

if (mongoUri) {
  mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 })
    .then(() => console.log('Conectado exitosamente a MongoDB Atlas'))
    .catch(error => console.error('Error conectando a MongoDB:', error.message));
} else {
  console.error('ERROR: No se encontró MONGODB_URI en las variables de entorno.');
}

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

module.exports = app;