const { Router } = require('express');
const { asyncHandler } = require('../../middlewares/errores');
const { verificarToken, permitirRoles } = require('../../middlewares/auth');
const c = require('./carrito.controller');

const r = Router();
r.use(verificarToken, permitirRoles('comprador'));
r.get('/', asyncHandler(c.obtener));
r.delete('/', asyncHandler(c.vaciar));
r.post('/items', asyncHandler(c.agregar));
r.patch('/items/:id', asyncHandler(c.cambiarCantidad));
r.delete('/items/:id', asyncHandler(c.quitar));
r.post('/enviar', asyncHandler(c.enviar));
module.exports = r;
