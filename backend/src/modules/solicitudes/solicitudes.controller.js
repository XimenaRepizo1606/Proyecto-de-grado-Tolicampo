// Sprint 4 – RF08 contacto directo por WhatsApp y RF09 gestión de solicitudes.
const pool = require('../../config/db');
const { ErrorApi } = require('../../middlewares/errores');
const { texto, entero } = require('../../utils/validar');
const { enlaceWhatsApp } = require('../../utils/whatsapp');

const ESTADOS = ['pendiente', 'atendida', 'cerrada'];

// POST /api/solicitudes  (comprador) { id_producto, mensaje?, cantidad? }
async function crear(req, res) {
  const b = req.body || {};
  const idProducto = entero(b.id_producto, 'id_producto');
  const mensaje = texto(b.mensaje, 'mensaje', { max: 500, opcional: true });
  let cantidad = null;
  if (b.cantidad !== undefined && b.cantidad !== null && b.cantidad !== '') {
    cantidad = Number(b.cantidad);
    if (!Number.isFinite(cantidad) || cantidad <= 0 || cantidad > 100000) throw new ErrorApi(400, 'La cantidad no es válida');
  }
  const [p] = await pool.query(
    `SELECT p.id_producto, p.nombre, p.unidad, p.estado, u.telefono, u.nombre AS productor
     FROM publicacion_producto p
     JOIN perfil_productor f ON f.id_productor = p.id_productor
     JOIN usuario u ON u.id_usuario = f.id_usuario
     WHERE p.id_producto = ?`, [idProducto]);
  if (!p.length || p[0].estado !== 'activo') throw new ErrorApi(404, 'El producto no está disponible');

  const [r] = await pool.query(
    'INSERT INTO solicitud_contacto (id_producto, id_comprador, mensaje, cantidad) VALUES (?, ?, ?, ?)',
    [idProducto, req.usuario.id, mensaje, cantidad]);
  const texto_wa = `Hola, vi su ${p[0].nombre} en ToliCampo y me interesa comprar` +
    (cantidad ? ` ${cantidad} ${p[0].unidad}(s)` : '') + '.' + (mensaje ? ` ${mensaje}` : '');
  res.status(201).json({
    mensaje: 'Solicitud enviada al productor',
    id_solicitud: r.insertId,
    enlace_whatsapp: enlaceWhatsApp(p[0].telefono, texto_wa),
  });
}

// GET /api/solicitudes/recibidas?estado=  (productor)
async function recibidas(req, res) {
  const filtros = ['f.id_usuario = ?']; const valores = [req.usuario.id];
  if (req.query.estado) {
    if (!ESTADOS.includes(req.query.estado)) throw new ErrorApi(400, 'Estado no válido');
    filtros.push('s.estado = ?'); valores.push(req.query.estado);
  }
  // El productor ve el nombre y el contacto del comprador porque este decidió escribirle
  const [filas] = await pool.query(
    `SELECT s.id_solicitud, s.estado, s.mensaje, s.cantidad, s.fecha_solicitud,
            p.id_producto, p.nombre AS producto, p.unidad,
            c.nombre AS comprador, c.telefono AS telefono_comprador, c.correo AS correo_comprador
     FROM solicitud_contacto s
     JOIN publicacion_producto p ON p.id_producto = s.id_producto
     JOIN perfil_productor f     ON f.id_productor = p.id_productor
     JOIN usuario c              ON c.id_usuario = s.id_comprador
     WHERE ${filtros.join(' AND ')} ORDER BY s.fecha_solicitud DESC`, valores);
  res.json({ solicitudes: filas.map((s) => ({ ...s,
    enlace_whatsapp: enlaceWhatsApp(s.telefono_comprador, `Hola ${s.comprador}, le escribo de ToliCampo por su solicitud de ${s.producto}.`) })) });
}

// GET /api/solicitudes/enviadas  (comprador)
async function enviadas(req, res) {
  const [filas] = await pool.query(
    `SELECT s.id_solicitud, s.estado, s.mensaje, s.cantidad, s.fecha_solicitud,
            p.id_producto, p.nombre AS producto, p.unidad, f.nombre_finca
     FROM solicitud_contacto s
     JOIN publicacion_producto p ON p.id_producto = s.id_producto
     JOIN perfil_productor f     ON f.id_productor = p.id_productor
     WHERE s.id_comprador = ? ORDER BY s.fecha_solicitud DESC`, [req.usuario.id]);
  res.json({ solicitudes: filas });
}

// PATCH /api/solicitudes/:id/estado  (productor dueño del producto)
async function cambiarEstado(req, res) {
  const id = entero(req.params.id, 'id');
  const { estado } = req.body || {};
  if (!ESTADOS.includes(estado)) throw new ErrorApi(400, 'El estado debe ser pendiente, atendida o cerrada');
  const [r] = await pool.query(
    `UPDATE solicitud_contacto s
     JOIN publicacion_producto p ON p.id_producto = s.id_producto
     JOIN perfil_productor f     ON f.id_productor = p.id_productor
     SET s.estado = ? WHERE s.id_solicitud = ? AND f.id_usuario = ?`, [estado, id, req.usuario.id]);
  if (!r.affectedRows) throw new ErrorApi(404, 'Solicitud no encontrada');
  res.json({ mensaje: 'Estado actualizado', id_solicitud: id, estado });
}

module.exports = { crear, recibidas, enviadas, cambiarEstado };
