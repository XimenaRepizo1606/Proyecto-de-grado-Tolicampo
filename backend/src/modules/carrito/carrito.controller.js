// Sprint 4 – Carrito y pedido por WhatsApp (sin pagos en línea, según la delimitación).
// Un pedido en estado 'carrito' es el carrito abierto del comprador.
const pool = require('../../config/db');
const { ErrorApi } = require('../../middlewares/errores');
const { entero } = require('../../utils/validar');
const { enlaceWhatsApp, pesos } = require('../../utils/whatsapp');

async function carritoAbierto(idComprador, con = pool) {
  const [f] = await con.query(
    "SELECT id_pedido FROM pedido WHERE id_comprador = ? AND estado = 'carrito' ORDER BY id_pedido DESC LIMIT 1", [idComprador]);
  if (f.length) return f[0].id_pedido;
  const [r] = await con.query('INSERT INTO pedido (id_comprador) VALUES (?)', [idComprador]);
  return r.insertId;
}

async function verCarrito(idComprador) {
  const idPedido = await carritoAbierto(idComprador);
  const [items] = await pool.query(
    `SELECT d.id_detalle, d.id_producto, p.nombre, p.foto_url, d.cantidad, d.unidad, d.precio_unitario, d.subtotal,
            f.id_productor, f.nombre_finca, p.estado AS estado_producto
     FROM detalle_pedido d
     JOIN publicacion_producto p ON p.id_producto = d.id_producto
     JOIN perfil_productor f     ON f.id_productor = p.id_productor
     WHERE d.id_pedido = ? ORDER BY d.id_detalle`, [idPedido]);
  const total = items.reduce((s, i) => s + Number(i.subtotal), 0);
  return { id_pedido: idPedido, items, total, cantidad_items: items.reduce((s, i) => s + Number(i.cantidad), 0) };
}

// Precio por la unidad elegida: el producto por kilo también se vende por libra (mitad del precio)
function precioPorUnidad(prod, unidad) {
  const final = Math.round(prod.precio_unitario * (1 - prod.descuento_pct / 100));
  if (unidad === prod.unidad) return final;
  if (prod.unidad === 'kilo' && unidad === 'libra') return Math.round(final / 2);
  throw new ErrorApi(400, `Este producto se vende por ${prod.unidad}`);
}

function cantidadValida(v) {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0 || n > 10000) throw new ErrorApi(400, 'La cantidad debe ser mayor que 0');
  return n;
}

// GET /api/carrito
async function obtener(req, res) {
  res.json(await verCarrito(req.usuario.id));
}

// POST /api/carrito/items  { id_producto, cantidad, unidad }
async function agregar(req, res) {
  const b = req.body || {};
  const idProducto = entero(b.id_producto, 'id_producto');
  const cantidad = cantidadValida(b.cantidad ?? 1);
  const [p] = await pool.query('SELECT * FROM publicacion_producto WHERE id_producto = ?', [idProducto]);
  if (!p.length || p[0].estado !== 'activo') throw new ErrorApi(404, 'El producto no está disponible');
  const unidad = b.unidad || p[0].unidad;
  const precio = precioPorUnidad(p[0], unidad);
  const idPedido = await carritoAbierto(req.usuario.id);

  // Si el producto ya está en el carrito con la misma unidad se suma la cantidad; si cambia la unidad, se reemplaza
  await pool.query(
    `INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, unidad, precio_unitario) VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       cantidad = IF(unidad = VALUES(unidad), cantidad + VALUES(cantidad), VALUES(cantidad)),
       unidad = VALUES(unidad), precio_unitario = VALUES(precio_unitario)`,
    [idPedido, idProducto, cantidad, unidad, precio]);
  res.status(201).json(await verCarrito(req.usuario.id));
}

async function itemPropio(req) {
  const id = entero(req.params.id, 'id');
  const [f] = await pool.query(
    `SELECT d.id_detalle FROM detalle_pedido d JOIN pedido pe ON pe.id_pedido = d.id_pedido
     WHERE d.id_detalle = ? AND pe.id_comprador = ? AND pe.estado = 'carrito'`, [id, req.usuario.id]);
  if (!f.length) throw new ErrorApi(404, 'El producto no está en su carrito');
  return id;
}

// PATCH /api/carrito/items/:id  { cantidad }
async function cambiarCantidad(req, res) {
  const id = await itemPropio(req);
  await pool.query('UPDATE detalle_pedido SET cantidad = ? WHERE id_detalle = ?', [cantidadValida(req.body?.cantidad), id]);
  res.json(await verCarrito(req.usuario.id));
}

// DELETE /api/carrito/items/:id
async function quitar(req, res) {
  const id = await itemPropio(req);
  await pool.query('DELETE FROM detalle_pedido WHERE id_detalle = ?', [id]);
  res.json(await verCarrito(req.usuario.id));
}

// DELETE /api/carrito  (vaciar)
async function vaciar(req, res) {
  const idPedido = await carritoAbierto(req.usuario.id);
  await pool.query('DELETE FROM detalle_pedido WHERE id_pedido = ?', [idPedido]);
  res.json(await verCarrito(req.usuario.id));
}

// POST /api/carrito/enviar  – cierra el pedido y devuelve un enlace de WhatsApp por cada productor.
// También crea una solicitud por producto para que el productor la vea en su panel (RF09).
async function enviar(req, res) {
  const carrito = await verCarrito(req.usuario.id);
  if (!carrito.items.length) throw new ErrorApi(400, 'Su carrito está vacío');
  const inactivos = carrito.items.filter((i) => i.estado_producto !== 'activo');
  if (inactivos.length) throw new ErrorApi(409, `Ya no están disponibles: ${inactivos.map((i) => i.nombre).join(', ')}. Quítelos del carrito.`);

  const [[comprador]] = await pool.query('SELECT nombre FROM usuario WHERE id_usuario = ?', [req.usuario.id]);
  const [contactos] = await pool.query(
    `SELECT f.id_productor, u.telefono FROM perfil_productor f JOIN usuario u ON u.id_usuario = f.id_usuario
     WHERE f.id_productor IN (?)`, [[...new Set(carrito.items.map((i) => i.id_productor))]]);
  const telefonos = Object.fromEntries(contactos.map((c) => [c.id_productor, c.telefono]));

  const con = await pool.getConnection();
  try {
    await con.beginTransaction();
    for (const i of carrito.items) {
      await con.query('INSERT INTO solicitud_contacto (id_producto, id_comprador, mensaje, cantidad) VALUES (?, ?, ?, ?)',
        [i.id_producto, req.usuario.id, `Pedido #${carrito.id_pedido}: ${i.cantidad} ${i.unidad}(s)`, i.cantidad]);
    }
    await con.query("UPDATE pedido SET estado = 'enviado', fecha_envio = NOW() WHERE id_pedido = ?", [carrito.id_pedido]);
    await con.commit();
  } catch (e) {
    await con.rollback(); throw e;
  } finally { con.release(); }

  // Un mensaje por productor, porque cada uno acuerda su propio pago y entrega
  const porProductor = {};
  for (const i of carrito.items) (porProductor[i.id_productor] ||= { finca: i.nombre_finca, items: [] }).items.push(i);
  const enlaces = Object.entries(porProductor).map(([id, g]) => {
    const total = g.items.reduce((s, i) => s + Number(i.subtotal), 0);
    const lineas = g.items.map((i) => `- ${i.cantidad} ${i.unidad}(s) de ${i.nombre}: ${pesos(i.subtotal)}`).join('\n');
    const msg = `Hola, soy ${comprador.nombre} y quiero hacer este pedido en ToliCampo (pedido #${carrito.id_pedido}):\n${lineas}\nTotal aproximado: ${pesos(total)}`;
    return { id_productor: Number(id), finca: g.finca, total, enlace_whatsapp: enlaceWhatsApp(telefonos[id], msg) };
  });
  res.json({ mensaje: 'Pedido enviado. Coordine el pago y la entrega con cada productor.', id_pedido: carrito.id_pedido, total: carrito.total, enlaces });
}

module.exports = { obtener, agregar, cambiarCantidad, quitar, vaciar, enviar };
