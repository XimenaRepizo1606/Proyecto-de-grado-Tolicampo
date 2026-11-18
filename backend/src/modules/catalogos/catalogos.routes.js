// Listas que usa el frontend para llenar los selectores (registro y publicación).
const { Router } = require('express');
const pool = require('../../config/db');
const { asyncHandler } = require('../../middlewares/errores');

const r = Router();
r.get('/categorias', asyncHandler(async (req, res) => {
  const [filas] = await pool.query('SELECT id_categoria, nombre FROM categoria ORDER BY id_categoria');
  res.json({ categorias: filas });
}));
r.get('/veredas', asyncHandler(async (req, res) => {
  const [filas] = await pool.query('SELECT id_vereda, nombre, corregimiento, municipio FROM vereda ORDER BY municipio, nombre');
  res.json({ veredas: filas });
}));
module.exports = r;
