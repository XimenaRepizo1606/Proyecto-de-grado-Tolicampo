const { Router } = require('express');
const { asyncHandler } = require('../../middlewares/errores');
const { verificarToken, permitirRoles } = require('../../middlewares/auth');
const c = require('./productores.controller');

const r = Router();
r.get('/mi-perfil', verificarToken, permitirRoles('productor'), asyncHandler(c.miPerfil));
r.put('/mi-perfil', verificarToken, permitirRoles('productor'), asyncHandler(c.actualizarMiPerfil));
r.get('/:id', asyncHandler(c.perfilPublico));
module.exports = r;
