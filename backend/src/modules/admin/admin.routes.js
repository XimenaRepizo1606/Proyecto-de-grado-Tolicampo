const { Router } = require('express');
const { asyncHandler } = require('../../middlewares/errores');
const { verificarToken, permitirRoles } = require('../../middlewares/auth');
const c = require('./admin.controller');

const r = Router();
r.use(verificarToken, permitirRoles('admin')); // todo el módulo es solo para el administrador
r.get('/productores', asyncHandler(c.productores));
r.patch('/productores/:id/verificar', asyncHandler(c.verificar));
r.get('/productos', asyncHandler(c.productos));
r.patch('/productos/:id/moderar', asyncHandler(c.moderar));
r.get('/reportes', asyncHandler(c.reportes));
module.exports = r;
