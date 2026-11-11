const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// carpeta para fotos de los clientes
fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });

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

async function startServer() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('No se encontró MONGODB_URI en el archivo .env');
  }

  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
  console.log('Conectado exitosamente a MongoDB Atlas');

  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

startServer().catch(error => {
  console.error('No se pudo iniciar el servidor:', error.message);
  process.exit(1);
});