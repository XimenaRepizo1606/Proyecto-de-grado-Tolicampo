// Sprint 2 – RF03: crear y editar el perfil del productor.
const pool = require('../../config/db');
const { ErrorApi } = require('../../middlewares/errores');
const { texto, entero } = require('../../utils/validar');

const SELECT_PERFIL = `
  SELECT p.id_productor, p.nombre_finca, p.cultivos, p.descripcion, p.verificado,
         u.nombre AS nombre_productor, v.id_vereda, v.nombre AS vereda, v.corregimiento, v.municipio
  FROM perfil_productor p
  JOIN usuario u ON u.id_usuario = p.id_usuario
  JOIN vereda v  ON v.id_vereda  = p.id_vereda`;

// GET /api/productores/mi-perfil  (productor)
async function miPerfil(req, res) {
  const [filas] = await pool.query(`${SELECT_PERFIL} WHERE p.id_usuario = ?`, [req.usuario.id]);
  if (!filas.length) throw new ErrorApi(404, 'Aún no tiene perfil de productor');
  res.json({ perfil: filas[0] });
}

// PUT /api/productores/mi-perfil  (productor) – actualiza solo los campos enviados
async function actualizarMiPerfil(req, res) {
  const b = req.body || {};
  const cambios = {};
  if (b.nombre_finca !== undefined) cambios.nombre_finca = texto(b.nombre_finca, 'nombre_finca', { min: 2, max: 100 });
  if (b.cultivos !== undefined) cambios.cultivos = texto(b.cultivos, 'cultivos', { min: 2, max: 255 });
  if (b.descripcion !== undefined) cambios.descripcion = texto(b.descripcion, 'descripcion', { max: 1000, opcional: true });
  if (b.id_vereda !== undefined) {
    cambios.id_vereda = entero(b.id_vereda, 'id_vereda');
    const [v] = await pool.query('SELECT 1 FROM vereda WHERE id_vereda = ?', [cambios.id_vereda]);
    if (!v.length) throw new ErrorApi(400, 'La vereda seleccionada no existe');
  }
  const campos = Object.keys(cambios);
  if (!campos.length) throw new ErrorApi(400, 'No envió ningún dato para actualizar');

  // Los nombres de columna salen de una lista fija (no del cliente); los valores van como parámetros
  const sets = campos.map((c) => `${c} = ?`).join(', ');
  const [r] = await pool.query(`UPDATE perfil_productor SET ${sets} WHERE id_usuario = ?`,
    [...campos.map((c) => cambios[c]), req.usuario.id]);
  if (!r.affectedRows) throw new ErrorApi(404, 'Aún no tiene perfil de productor');
  return miPerfil(req, res);
}

// GET /api/productores/:id  (público) – perfil sin datos de contacto
async function perfilPublico(req, res) {
  const id = entero(req.params.id, 'id');
  const [filas] = await pool.query(`${SELECT_PERFIL} WHERE p.id_productor = ?`, [id]);
  if (!filas.length) throw new ErrorApi(404, 'Productor no encontrado');
  res.json({ perfil: filas[0] });
}

module.exports = { miPerfil, actualizarMiPerfil, perfilPublico };
