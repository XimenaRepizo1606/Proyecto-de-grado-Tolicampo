// Sprint 4 – RF10 precios de referencia y RF12 carga de precios desde un archivo CSV.
const { parse } = require('csv-parse/sync');
const pool = require('../../config/db');
const { ErrorApi } = require('../../middlewares/errores');

// GET /api/precios  – el precio más reciente de cada producto, junto al menor precio en ToliCampo
async function listar(req, res) {
  const [filas] = await pool.query(
    `SELECT r.nombre_producto, c.nombre AS categoria, r.valor_kg, r.fuente, r.fecha_dato,
            (SELECT MIN(ROUND(p.precio_unitario * (1 - p.descuento_pct / 100), 0))
               FROM publicacion_producto p
              WHERE p.nombre = r.nombre_producto AND p.estado = 'activo' AND p.unidad = 'kilo') AS precio_tolicampo_kg
     FROM precio_referencia r
     JOIN categoria c ON c.id_categoria = r.id_categoria
     WHERE r.fecha_dato = (SELECT MAX(r2.fecha_dato) FROM precio_referencia r2 WHERE r2.nombre_producto = r.nombre_producto)
     ORDER BY r.nombre_producto`);
  res.json({ precios: filas });
}

// POST /api/precios/csv  (admin) – archivo en el campo "archivo"
// Columnas: producto,categoria,valor_kg,fecha[,fuente]   (fecha en formato AAAA-MM-DD)
async function cargarCsv(req, res) {
  if (!req.file) throw new ErrorApi(400, 'Adjunte el archivo CSV en el campo "archivo"');
  let filas;
  try {
    filas = parse(req.file.buffer.toString('utf8').replace(/^﻿/, ''), {
      columns: (h) => h.map((c) => c.trim().toLowerCase()), skip_empty_lines: true, trim: true,
      delimiter: [',', ';'], // Excel en español suele guardar con punto y coma
    });
  } catch (e) {
    throw new ErrorApi(400, 'El archivo no es un CSV válido');
  }
  if (!filas.length) throw new ErrorApi(400, 'El archivo no tiene filas');
  if (filas.length > 1000) throw new ErrorApi(400, 'El archivo tiene más de 1.000 filas');

  const [cats] = await pool.query('SELECT id_categoria, nombre FROM categoria');
  const idCategoria = Object.fromEntries(cats.map((c) => [c.nombre.toLowerCase(), c.id_categoria]));

  const errores = []; const validas = [];
  filas.forEach((f, i) => {
    const linea = i + 2; // la línea 1 es el encabezado
    const producto = (f.producto || '').slice(0, 100);
    const cat = idCategoria[(f.categoria || '').toLowerCase()];
    const valor = Number(String(f.valor_kg || '').replace(/\./g, '').replace(',', '.'));
    const fecha = f.fecha || '';
    if (!producto) return errores.push({ linea, error: 'Falta el producto' });
    if (!cat) return errores.push({ linea, error: `La categoría "${f.categoria}" no existe` });
    if (!Number.isFinite(valor) || valor <= 0) return errores.push({ linea, error: 'El valor_kg no es válido' });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || Number.isNaN(Date.parse(fecha))) return errores.push({ linea, error: 'La fecha debe tener el formato AAAA-MM-DD' });
    validas.push([cat, producto, valor, (f.fuente || 'SIPSA-DANE').slice(0, 100), fecha]);
  });
  if (errores.length) throw new ErrorApi(400, 'El archivo tiene errores; no se cargó ningún precio', errores);

  const con = await pool.getConnection();
  try {
    await con.beginTransaction();
    for (const v of validas) {
      // Si ya existe el precio de ese producto, fuente y fecha, se actualiza el valor
      await con.query(
        `INSERT INTO precio_referencia (id_categoria, nombre_producto, valor_kg, fuente, fecha_dato) VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE valor_kg = VALUES(valor_kg), id_categoria = VALUES(id_categoria)`, v);
    }
    await con.commit();
  } catch (e) {
    await con.rollback(); throw e;
  } finally { con.release(); }
  res.status(201).json({ mensaje: `Se cargaron ${validas.length} precios`, cargados: validas.length });
}

module.exports = { listar, cargarCsv };
