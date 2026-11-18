const { Router } = require('express');
const multer = require('multer');
const { asyncHandler, ErrorApi } = require('../../middlewares/errores');
const { verificarToken, permitirRoles } = require('../../middlewares/auth');
const c = require('./precios.controller');

// El CSV se lee en memoria (máximo 1 MB); no se guarda en el disco
const subirCsv = multer({
  storage: multer.memoryStorage(), limits: { fileSize: 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => (/\.csv$/i.test(file.originalname) ? cb(null, true) : cb(new ErrorApi(400, 'El archivo debe ser .csv'))),
}).single('archivo');

const r = Router();
r.get('/', asyncHandler(c.listar));
r.post('/csv', verificarToken, permitirRoles('admin'), subirCsv, asyncHandler(c.cargarCsv));
module.exports = r;
