const { Router } = require('express');
const { asyncHandler } = require('../../middlewares/errores');
const { verificarToken, permitirRoles } = require('../../middlewares/auth');
const { manejarFoto } = require('../../config/subidas');
const c = require('./productos.controller');

const soloProductor = [verificarToken, permitirRoles('productor')];
const r = Router();
r.get('/', asyncHandler(c.catalogo));
r.get('/ofertas', asyncHandler(c.ofertas));
r.get('/mios', ...soloProductor, asyncHandler(c.mios));
r.get('/:id', asyncHandler(c.detalle));
r.post('/', ...soloProductor, manejarFoto, asyncHandler(c.publicar));
r.put('/:id', ...soloProductor, manejarFoto, asyncHandler(c.editar));
r.patch('/:id/estado', ...soloProductor, asyncHandler(c.cambiarEstado));
module.exports = r;
