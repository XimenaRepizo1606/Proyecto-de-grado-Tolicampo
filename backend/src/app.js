const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { CARPETA } = require('./config/subidas');
const { noEncontrado, manejadorErrores } = require('./middlewares/errores');

const app = express();
// Permite que el frontend (otro dominio) muestre las fotos de /uploads
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: (process.env.CORS_ORIGIN || '*').split(',') }));
app.use(express.json({ limit: '100kb' }));

app.use('/uploads', express.static(CARPETA, { maxAge: '7d' }));

app.get('/api/salud', (req, res) => res.json({ estado: 'ok', servicio: 'API ToliCampo' }));
app.use('/api/auth', require('./modules/auth/auth.routes'));          // Sprint 2: RF01, RF02
app.use('/api/productores', require('./modules/productores/productores.routes')); // Sprint 2: RF03
app.use('/api/productos', require('./modules/productos/productos.routes'));       // Sprint 3: RF04 a RF07
app.use('/api', require('./modules/catalogos/catalogos.routes'));     // categorías y veredas

app.use(noEncontrado);
app.use(manejadorErrores);
module.exports = app;
