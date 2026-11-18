// Subida de fotos de productos (RF04). Solo imágenes JPG, PNG o WEBP de máximo 2 MB.
// Nota: en Railway el disco se borra al volver a desplegar; para producción real
// convendría un servicio de almacenamiento externo (fuera del alcance del prototipo).
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const { ErrorApi } = require('../middlewares/errores');

const CARPETA = path.join(__dirname, '..', '..', 'uploads');
const TIPOS = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

const subirFoto = multer({
  storage: multer.diskStorage({
    destination: CARPETA,
    // Nombre aleatorio: no se usa el nombre que envía el usuario
    filename: (req, file, cb) => cb(null, crypto.randomUUID() + TIPOS[file.mimetype]),
  }),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) =>
    TIPOS[file.mimetype] ? cb(null, true) : cb(new ErrorApi(400, 'La foto debe ser JPG, PNG o WEBP')),
}).single('foto');

// Envuelve multer para convertir sus errores en mensajes claros
const manejarFoto = (req, res, next) =>
  subirFoto(req, res, (err) => {
    if (err && err.code === 'LIMIT_FILE_SIZE') return next(new ErrorApi(400, 'La foto no puede pesar más de 2 MB'));
    next(err);
  });

module.exports = { manejarFoto, CARPETA };
