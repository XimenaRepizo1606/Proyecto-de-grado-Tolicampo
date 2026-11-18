const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const { asyncHandler } = require('../../middlewares/errores');
const { verificarToken } = require('../../middlewares/auth');
const c = require('./auth.controller');

// Limita los intentos de inicio de sesión (protección contra fuerza bruta, OWASP A07)
const limiteLogin = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false,
  message: { error: 'Demasiados intentos. Intente de nuevo en 15 minutos.' } });

const r = Router();
r.post('/registro', asyncHandler(c.registro));
r.post('/login', limiteLogin, asyncHandler(c.login));
r.get('/yo', verificarToken, asyncHandler(c.yo));
module.exports = r;
