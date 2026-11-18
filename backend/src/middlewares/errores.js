// Errores controlados de la API y manejador central de errores.
class ErrorApi extends Error {
  constructor(estado, mensaje, detalles) {
    super(mensaje);
    this.estado = estado;
    this.detalles = detalles;
  }
}

function noEncontrado(req, res) {
  res.status(404).json({ error: 'Ruta no encontrada' });
}

// eslint-disable-next-line no-unused-vars
function manejadorErrores(err, req, res, next) {
  if (err instanceof ErrorApi) {
    return res.status(err.estado).json({ error: err.message, ...(err.detalles ? { detalles: err.detalles } : {}) });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido' });
  }
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'Ya existe un registro con esos datos' });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
}

// Permite usar funciones async en las rutas sin repetir try/catch
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { ErrorApi, noEncontrado, manejadorErrores, asyncHandler };
