// Sprint 2 – RF01 (registro con autorización de datos) y RF02 (inicio de sesión).
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../../config/db');
const { ErrorApi } = require('../../middlewares/errores');
const { esCorreo, esTelefono, esClaveSegura, texto, entero } = require('../../utils/validar');

const COSTO_BCRYPT = 10;

function crearToken(usuario) {
  return jwt.sign({ id: usuario.id_usuario, rol: usuario.rol }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRA || '8h',
  });
}

// Datos que se pueden devolver al cliente (nunca el hash de la contraseña)
const usuarioPublico = (u) => ({
  id_usuario: u.id_usuario, nombre: u.nombre, correo: u.correo, telefono: u.telefono, rol: u.rol,
});

// POST /api/auth/registro
async function registro(req, res) {
  const b = req.body || {};
  const nombre = texto(b.nombre, 'nombre', { min: 3, max: 100 });
  const correo = b.correo ? String(b.correo).trim().toLowerCase() : null;
  const telefono = b.telefono ? String(b.telefono).replace(/\s/g, '') : null;
  const rol = b.rol;

  if (!['productor', 'comprador'].includes(rol)) throw new ErrorApi(400, 'El rol debe ser "productor" o "comprador"');
  if (!correo && !telefono) throw new ErrorApi(400, 'Debe registrar un correo o un número de celular');
  if (correo && !esCorreo(correo)) throw new ErrorApi(400, 'El correo no es válido');
  if (telefono && !esTelefono(telefono)) throw new ErrorApi(400, 'El celular debe tener 10 dígitos y empezar por 3');
  if (!esClaveSegura(b.contrasena)) {
    throw new ErrorApi(400, 'La contraseña debe tener al menos 8 caracteres, con letras y números');
  }
  // Ley 1581 de 2012: sin autorización no hay registro (RF01, RNF06)
  if (b.acepta_tratamiento_datos !== true) {
    throw new ErrorApi(400, 'Debe autorizar el tratamiento de sus datos personales para registrarse');
  }

  // El productor necesita celular (contacto por WhatsApp, RF08) y los datos de su finca (RF03)
  let finca = null;
  if (rol === 'productor') {
    if (!telefono) throw new ErrorApi(400, 'El productor debe registrar un celular con WhatsApp');
    finca = {
      nombre_finca: texto(b.nombre_finca, 'nombre_finca', { min: 2, max: 100 }),
      id_vereda: entero(b.id_vereda, 'id_vereda'),
      cultivos: texto(b.cultivos, 'cultivos', { min: 2, max: 255 }),
      descripcion: texto(b.descripcion, 'descripcion', { max: 1000, opcional: true }),
    };
  }

  const hash = await bcrypt.hash(b.contrasena, COSTO_BCRYPT);
  const con = await pool.getConnection();
  try {
    await con.beginTransaction();
    if (finca) {
      const [v] = await con.query('SELECT id_vereda FROM vereda WHERE id_vereda = ?', [finca.id_vereda]);
      if (!v.length) throw new ErrorApi(400, 'La vereda seleccionada no existe');
    }
    const [r] = await con.query(
      `INSERT INTO usuario (nombre, correo, telefono, contrasena_hash, rol, acepta_tratamiento_datos)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [nombre, correo, telefono, hash, rol]
    );
    if (finca) {
      await con.query(
        `INSERT INTO perfil_productor (id_usuario, id_vereda, nombre_finca, cultivos, descripcion)
         VALUES (?, ?, ?, ?, ?)`,
        [r.insertId, finca.id_vereda, finca.nombre_finca, finca.cultivos, finca.descripcion]
      );
    }
    await con.commit();
    const usuario = { id_usuario: r.insertId, nombre, correo, telefono, rol };
    res.status(201).json({ mensaje: 'Registro exitoso', token: crearToken(usuario), usuario });
  } catch (e) {
    await con.rollback();
    if (e.code === 'ER_DUP_ENTRY') throw new ErrorApi(409, 'Ya existe una cuenta con ese correo o celular');
    throw e;
  } finally {
    con.release();
  }
}

// POST /api/auth/login  { "usuario": "correo o celular", "contrasena": "..." }
async function login(req, res) {
  const b = req.body || {};
  const identificador = texto(b.usuario, 'usuario', { max: 120 }).toLowerCase();
  if (typeof b.contrasena !== 'string' || !b.contrasena) throw new ErrorApi(400, 'El campo "contrasena" es obligatorio');

  const [filas] = await pool.query(
    'SELECT * FROM usuario WHERE correo = ? OR telefono = ? LIMIT 1',
    [identificador, identificador]
  );
  const u = filas[0];
  // Mismo mensaje si el usuario no existe o la clave es incorrecta (no revela qué falló)
  const valido = u ? await bcrypt.compare(b.contrasena, u.contrasena_hash) : false;
  if (!valido) throw new ErrorApi(401, 'Usuario o contraseña incorrectos');

  res.json({ token: crearToken(u), usuario: usuarioPublico(u) });
}

// GET /api/auth/yo  (requiere token)
async function yo(req, res) {
  const [filas] = await pool.query('SELECT * FROM usuario WHERE id_usuario = ?', [req.usuario.id]);
  if (!filas.length) throw new ErrorApi(404, 'Usuario no encontrado');
  res.json({ usuario: usuarioPublico(filas[0]) });
}

module.exports = { registro, login, yo };
