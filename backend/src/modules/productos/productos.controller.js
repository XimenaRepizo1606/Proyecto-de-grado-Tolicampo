// Sprint 3 – RF04 publicar, RF05 editar/pausar/agotado, RF06 catálogo con filtros, RF07 detalle.
const fs = require('fs');
const path = require('path');
const pool = require('../../config/db');
const { CARPETA } = require('../../config/subidas');
const { ErrorApi } = require('../../middlewares/errores');
const { texto, entero } = require('../../utils/validar');

const UNIDADES = ['kilo', 'libra', 'arroba', 'bulto'];
const ESTADOS_PRODUCTOR = ['activo', 'pausado', 'agotado']; // 'oculto' solo lo usa el administrador

// Consulta base: producto + categoría + finca + municipio + precio final + precio de referencia
const SELECT_PRODUCTO = `
  SELECT p.id_producto, p.nombre, p.id_categoria, c.nombre AS categoria,
         p.precio_unitario, p.descuento_pct,
         ROUND(p.precio_unitario * (1 - p.descuento_pct / 100), 0) AS precio_final,
         p.unidad, p.cantidad_disponible, p.foto_url, p.estado,
         f.id_productor, f.nombre_finca, f.verificado, v.municipio,
         (SELECT r.valor_kg FROM precio_referencia r
           WHERE r.nombre_producto = p.nombre ORDER BY r.fecha_dato DESC LIMIT 1) AS precio_referencia_kg,
         (SELECT r.fecha_dato FROM precio_referencia r
           WHERE r.nombre_producto = p.nombre ORDER BY r.fecha_dato DESC LIMIT 1) AS fecha_referencia
  FROM publicacion_producto p
  JOIN categoria c        ON c.id_categoria = p.id_categoria
  JOIN perfil_productor f ON f.id_productor = p.id_productor
  JOIN vereda v           ON v.id_vereda    = f.id_vereda`;

// Agrega el precio por libra que muestran las tarjetas del prototipo
const conLibra = (p) => ({ ...p, precio_libra: p.unidad === 'kilo' ? Math.round(p.precio_final / 2) : null });
const urlFoto = (archivo) => (archivo ? `/uploads/${archivo.filename}` : undefined);
const borrarFoto = (url) => {
  if (url && url.startsWith('/uploads/')) fs.unlink(path.join(CARPETA, path.basename(url)), () => {});
};

function numero(valor, campo, { min = 0, max = 1e9, opcional = false } = {}) {
  if (valor === undefined || valor === null || valor === '') {
    if (opcional) return undefined;
    throw new ErrorApi(400, `El campo "${campo}" es obligatorio`);
  }
  const n = Number(valor);
  if (!Number.isFinite(n) || n < min || n > max) throw new ErrorApi(400, `El campo "${campo}" no es válido`);
  return n;
}

async function idProductor(idUsuario) {
  const [f] = await pool.query('SELECT id_productor FROM perfil_productor WHERE id_usuario = ?', [idUsuario]);
  if (!f.length) throw new ErrorApi(403, 'Debe tener perfil de productor para publicar');
  return f[0].id_productor;
}

async function productoPropio(req) {
  const id = entero(req.params.id, 'id');
  const prod = await idProductor(req.usuario.id);
  const [f] = await pool.query('SELECT * FROM publicacion_producto WHERE id_producto = ?', [id]);
  if (!f.length) throw new ErrorApi(404, 'Producto no encontrado');
  if (f[0].id_productor !== prod) throw new ErrorApi(403, 'Solo puede modificar sus propios productos');
  return f[0];
}

// GET /api/productos?categoria=&q=&min=&max=&municipio=&pagina=&limite=
async function catalogo(req, res) {
  const q = req.query;
  const filtros = ["p.estado = 'activo'"];
  const valores = [];
  if (q.categoria) {
    if (/^\d+$/.test(q.categoria)) { filtros.push('p.id_categoria = ?'); valores.push(Number(q.categoria)); }
    else { filtros.push('c.nombre = ?'); valores.push(String(q.categoria)); }
  }
  if (q.q) {
    // Busca en producto, finca y municipio (como el buscador del prototipo)
    const t = `%${String(q.q).slice(0, 60)}%`;
    filtros.push('(p.nombre LIKE ? OR f.nombre_finca LIKE ? OR v.municipio LIKE ?)');
    valores.push(t, t, t);
  }
  if (q.municipio) { filtros.push('v.municipio = ?'); valores.push(String(q.municipio)); }
  const precioFinal = 'p.precio_unitario * (1 - p.descuento_pct / 100)';
  if (q.min) { filtros.push(`${precioFinal} >= ?`); valores.push(numero(q.min, 'min')); }
  if (q.max) { filtros.push(`${precioFinal} <= ?`); valores.push(numero(q.max, 'max')); }

  const limite = Math.min(entero(q.limite || 24, 'limite'), 100);
  const pagina = entero(q.pagina || 1, 'pagina');
  const where = 'WHERE ' + filtros.join(' AND ');

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM publicacion_producto p
     JOIN categoria c ON c.id_categoria = p.id_categoria
     JOIN perfil_productor f ON f.id_productor = p.id_productor
     JOIN vereda v ON v.id_vereda = f.id_vereda ${where}`, valores);
  const [filas] = await pool.query(`${SELECT_PRODUCTO} ${where} ORDER BY c.id_categoria, p.nombre LIMIT ? OFFSET ?`,
    [...valores, limite, (pagina - 1) * limite]);
  res.json({ total, pagina, limite, productos: filas.map(conLibra) });
}

// GET /api/productos/ofertas
async function ofertas(req, res) {
  const [filas] = await pool.query(
    `${SELECT_PRODUCTO} WHERE p.estado = 'activo' AND p.descuento_pct > 0 ORDER BY p.descuento_pct DESC LIMIT 8`);
  res.json({ productos: filas.map(conLibra) });
}

// GET /api/productos/:id  (público: solo productos activos o agotados)
async function detalle(req, res) {
  const id = entero(req.params.id, 'id');
  const [filas] = await pool.query(`${SELECT_PRODUCTO} WHERE p.id_producto = ? AND p.estado IN ('activo','agotado')`, [id]);
  if (!filas.length) throw new ErrorApi(404, 'Producto no encontrado');
  res.json({ producto: conLibra(filas[0]) });
}

// GET /api/productos/mios  (productor)
async function mios(req, res) {
  const prod = await idProductor(req.usuario.id);
  const [filas] = await pool.query(`${SELECT_PRODUCTO} WHERE p.id_productor = ? ORDER BY p.id_producto DESC`, [prod]);
  res.json({ productos: filas.map(conLibra) });
}

async function validarCategoria(id) {
  const [c] = await pool.query('SELECT 1 FROM categoria WHERE id_categoria = ?', [id]);
  if (!c.length) throw new ErrorApi(400, 'La categoría no existe');
}

// POST /api/productos  (productor) – multipart/form-data con campo opcional "foto"
async function publicar(req, res) {
  try {
    const b = req.body || {};
    const prod = await idProductor(req.usuario.id);
    const datos = {
      nombre: texto(b.nombre, 'nombre', { min: 2, max: 100 }),
      id_categoria: entero(b.id_categoria, 'id_categoria'),
      precio_unitario: numero(b.precio_unitario, 'precio_unitario', { min: 1, max: 10000000 }),
      unidad: b.unidad || 'kilo',
      descuento_pct: numero(b.descuento_pct, 'descuento_pct', { max: 90, opcional: true }) ?? 0,
      cantidad_disponible: numero(b.cantidad_disponible, 'cantidad_disponible', { min: 0, max: 1000000 }),
    };
    if (!UNIDADES.includes(datos.unidad)) throw new ErrorApi(400, 'La unidad debe ser kilo, libra, arroba o bulto');
    await validarCategoria(datos.id_categoria);
    const [r] = await pool.query(
      `INSERT INTO publicacion_producto
        (id_productor, id_categoria, nombre, precio_unitario, unidad, descuento_pct, cantidad_disponible, foto_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [prod, datos.id_categoria, datos.nombre, datos.precio_unitario, datos.unidad, datos.descuento_pct,
        datos.cantidad_disponible, urlFoto(req.file) || null]);
    const [filas] = await pool.query(`${SELECT_PRODUCTO} WHERE p.id_producto = ?`, [r.insertId]);
    res.status(201).json({ mensaje: 'Producto publicado', producto: conLibra(filas[0]) });
  } catch (e) {
    if (req.file) borrarFoto(urlFoto(req.file)); // no deja fotos sueltas si algo falla
    throw e;
  }
}

// PUT /api/productos/:id  (productor dueño) – actualiza solo los campos enviados
async function editar(req, res) {
  try {
    const actual = await productoPropio(req);
    const b = req.body || {};
    const cambios = {};
    if (b.nombre !== undefined) cambios.nombre = texto(b.nombre, 'nombre', { min: 2, max: 100 });
    if (b.id_categoria !== undefined) { cambios.id_categoria = entero(b.id_categoria, 'id_categoria'); await validarCategoria(cambios.id_categoria); }
    if (b.precio_unitario !== undefined) cambios.precio_unitario = numero(b.precio_unitario, 'precio_unitario', { min: 1, max: 10000000 });
    if (b.descuento_pct !== undefined) cambios.descuento_pct = numero(b.descuento_pct, 'descuento_pct', { max: 90 });
    if (b.cantidad_disponible !== undefined) cambios.cantidad_disponible = numero(b.cantidad_disponible, 'cantidad_disponible', { max: 1000000 });
    if (b.unidad !== undefined) {
      if (!UNIDADES.includes(b.unidad)) throw new ErrorApi(400, 'La unidad debe ser kilo, libra, arroba o bulto');
      cambios.unidad = b.unidad;
    }
    if (req.file) cambios.foto_url = urlFoto(req.file);
    const campos = Object.keys(cambios);
    if (!campos.length) throw new ErrorApi(400, 'No envió ningún dato para actualizar');
    await pool.query(`UPDATE publicacion_producto SET ${campos.map((c) => `${c} = ?`).join(', ')} WHERE id_producto = ?`,
      [...campos.map((c) => cambios[c]), actual.id_producto]);
    if (req.file) borrarFoto(actual.foto_url);
    const [filas] = await pool.query(`${SELECT_PRODUCTO} WHERE p.id_producto = ?`, [actual.id_producto]);
    res.json({ mensaje: 'Producto actualizado', producto: conLibra(filas[0]) });
  } catch (e) {
    if (req.file) borrarFoto(urlFoto(req.file));
    throw e;
  }
}

// PATCH /api/productos/:id/estado  { "estado": "activo" | "pausado" | "agotado" }
async function cambiarEstado(req, res) {
  const actual = await productoPropio(req);
  const { estado } = req.body || {};
  if (!ESTADOS_PRODUCTOR.includes(estado)) throw new ErrorApi(400, 'El estado debe ser activo, pausado o agotado');
  if (actual.estado === 'oculto') throw new ErrorApi(403, 'El administrador ocultó esta publicación; comuníquese con él');
  await pool.query('UPDATE publicacion_producto SET estado = ? WHERE id_producto = ?', [estado, actual.id_producto]);
  res.json({ mensaje: `Producto ${estado}`, id_producto: actual.id_producto, estado });
}

module.exports = { catalogo, ofertas, detalle, mios, publicar, editar, cambiarEstado };
