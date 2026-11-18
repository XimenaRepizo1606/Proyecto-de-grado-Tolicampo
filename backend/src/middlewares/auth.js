// Verificación del token JWT y control de acceso por rol (RF02, RNF05).
const jwt = require('jsonwebtoken');
const { ErrorApi } = require('./errores');

function verificarToken(req, res, next) {
  const cabecera = req.headers.authorization || '';
  const [tipo, token] = cabecera.split(' ');
  if (tipo !== 'Bearer' || !token) return next(new ErrorApi(401, 'Debe iniciar sesión'));
  try {
    const datos = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = { id: datos.id, rol: datos.rol };
    next();
  } catch (e) {
    next(new ErrorApi(401, 'La sesión no es válida o expiró'));
  }
}

// Uso: permitirRoles('productor') o permitirRoles('admin', 'productor')
const permitirRoles = (...roles) => (req, res, next) =>
  roles.includes(req.usuario?.rol) ? next() : next(new ErrorApi(403, 'No tiene permiso para esta acción'));

module.exports = { verificarToken, permitirRoles };
