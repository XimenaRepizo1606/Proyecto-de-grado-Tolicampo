// Sprint 4 – RF11 verificar productores y moderar publicaciones; RF13 reportes.
const pool = require('../../config/db');
const { ErrorApi } = require('../../middlewares/errores');
const { entero } = require('../../utils/validar');

// GET /api/admin/productores?verificado=0|1
async function productores(req, res) {
  const filtros = []; const valores = [];
  if (req.query.verificado !== undefined) { filtros.push('f.verificado = ?'); valores.push(req.query.verificado === '1' ? 1 : 0); }
  const [filas] = await pool.query(
    `SELECT f.id_productor, f.nombre_finca, f.cultivos, f.verificado, u.nombre, u.correo, u.telefono, u.fecha_registro,
            v.nombre AS vereda, v.municipio,
            (SELECT COUNT(*) FROM publicacion_producto p WHERE p.id_productor = f.id_productor) AS productos
     FROM perfil_productor f JOIN usuario u ON u.id_usuario = f.id_usuario JOIN vereda v ON v.id_vereda = f.id_vereda
     ${filtros.length ? 'WHERE ' + filtros.join(' AND ') : ''} ORDER BY f.verificado, u.fecha_registro DESC`, valores);
  res.json({ productores: filas });
}

// PATCH /api/admin/productores/:id/verificar  { "verificado": true | false }
async function verificar(req, res) {
  const id = entero(req.params.id, 'id');
  const valor = req.body?.verificado === false ? 0 : 1;
  const [r] = await pool.query('UPDATE perfil_productor SET verificado = ? WHERE id_productor = ?', [valor, id]);
  if (!r.affectedRows) throw new ErrorApi(404, 'Productor no encontrado');
  res.json({ mensaje: valor ? 'Productor verificado' : 'Verificación retirada', id_productor: id, verificado: valor });
}

// GET /api/admin/productos?estado=
async function productos(req, res) {
  const estados = ['activo', 'pausado', 'agotado', 'oculto'];
  const filtro = estados.includes(req.query.estado) ? 'WHERE p.estado = ?' : '';
  const [filas] = await pool.query(
    `SELECT p.id_producto, p.nombre, p.precio_unitario, p.descuento_pct, p.unidad, p.estado, p.foto_url,
            c.nombre AS categoria, f.nombre_finca, f.id_productor
     FROM publicacion_producto p JOIN categoria c ON c.id_categoria = p.id_categoria
     JOIN perfil_productor f ON f.id_productor = p.id_productor ${filtro} ORDER BY p.id_producto DESC`,
    filtro ? [req.query.estado] : []);
  res.json({ productos: filas });
}

// PATCH /api/admin/productos/:id/moderar  { "oculto": true | false }
async function moderar(req, res) {
  const id = entero(req.params.id, 'id');
  const ocultar = req.body?.oculto !== false;
  const [r] = await pool.query('UPDATE publicacion_producto SET estado = ? WHERE id_producto = ?', [ocultar ? 'oculto' : 'activo', id]);
  if (!r.affectedRows) throw new ErrorApi(404, 'Producto no encontrado');
  res.json({ mensaje: ocultar ? 'Publicación ocultada' : 'Publicación visible de nuevo', id_producto: id, estado: ocultar ? 'oculto' : 'activo' });
}

// GET /api/admin/reportes  (RF13) – sirve también para los indicadores del informe
async function reportes(req, res) {
  const contar = async (sql) => (await pool.query(sql))[0];
  const [usuarios, productores, productos, solicitudes, pedidos, categorias] = await Promise.all([
    contar('SELECT rol, COUNT(*) AS total FROM usuario GROUP BY rol'),
    contar('SELECT verificado, COUNT(*) AS total FROM perfil_productor GROUP BY verificado'),
    contar('SELECT estado, COUNT(*) AS total FROM publicacion_producto GROUP BY estado'),
    contar('SELECT estado, COUNT(*) AS total FROM solicitud_contacto GROUP BY estado'),
    contar("SELECT COUNT(*) AS enviados, COALESCE(SUM(t.total),0) AS valor_total FROM pedido pe JOIN (SELECT id_pedido, SUM(subtotal) AS total FROM detalle_pedido GROUP BY id_pedido) t ON t.id_pedido = pe.id_pedido WHERE pe.estado = 'enviado'"),
    contar("SELECT c.nombre AS categoria, COUNT(p.id_producto) AS productos FROM categoria c LEFT JOIN publicacion_producto p ON p.id_categoria = c.id_categoria AND p.estado = 'activo' GROUP BY c.id_categoria ORDER BY c.id_categoria"),
  ]);
  const aObjeto = (filas, clave) => Object.fromEntries(filas.map((f) => [f[clave], f.total]));
  res.json({
    usuarios: aObjeto(usuarios, 'rol'),
    productores: { verificados: aObjeto(productores, 'verificado')[1] || 0, pendientes: aObjeto(productores, 'verificado')[0] || 0 },
    productos_por_estado: aObjeto(productos, 'estado'),
    solicitudes_por_estado: aObjeto(solicitudes, 'estado'),
    pedidos_enviados: { cantidad: pedidos[0].enviados, valor_total: Number(pedidos[0].valor_total) },
    productos_activos_por_categoria: categorias,
  });
}

module.exports = { productores, verificar, productos, moderar, reportes };
