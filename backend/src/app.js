const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { noEncontrado, manejadorErrores } = require('./middlewares/errores');

const app = express();
app.use(helmet());
app.use(cors({ origin: (process.env.CORS_ORIGIN || '*').split(',') }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/salud', (req, res) => res.json({ estado: 'ok', servicio: 'API ToliCampo' }));
app.use('/api/auth', require('./modules/auth/auth.routes'));          // Sprint 2: RF01, RF02
app.use('/api/productores', require('./modules/productores/productores.routes')); // Sprint 2: RF03
app.use('/api', require('./modules/catalogos/catalogos.routes'));     // categorías y veredas

app.use(noEncontrado);
app.use(manejadorErrores);
module.exports = app;
