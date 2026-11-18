const { Router } = require('express');
const { asyncHandler } = require('../../middlewares/errores');
const { verificarToken, permitirRoles } = require('../../middlewares/auth');
const c = require('./solicitudes.controller');

const r = Router();
r.use(verificarToken);
r.post('/', permitirRoles('comprador'), asyncHandler(c.crear));
r.get('/recibidas', permitirRoles('productor'), asyncHandler(c.recibidas));
r.get('/enviadas', permitirRoles('comprador'), asyncHandler(c.enviadas));
r.patch('/:id/estado', permitirRoles('productor'), asyncHandler(c.cambiarEstado));
module.exports = r;
