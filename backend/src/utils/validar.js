// Validación de entradas (OWASP: validar todo lo que llega del cliente).
const { ErrorApi } = require('../middlewares/errores');

const esCorreo = (v) => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) && v.length <= 120;
const esTelefono = (v) => typeof v === 'string' && /^3\d{9}$/.test(v); // celular colombiano de 10 dígitos
const esClaveSegura = (v) => typeof v === 'string' && v.length >= 8 && v.length <= 72 && /[A-Za-z]/.test(v) && /\d/.test(v);

function texto(valor, campo, { min = 1, max = 255, opcional = false } = {}) {
  if (valor === undefined || valor === null || valor === '') {
    if (opcional) return null;
    throw new ErrorApi(400, `El campo "${campo}" es obligatorio`);
  }
  if (typeof valor !== 'string') throw new ErrorApi(400, `El campo "${campo}" debe ser texto`);
  const limpio = valor.trim();
  if (limpio.length < min || limpio.length > max) {
    throw new ErrorApi(400, `El campo "${campo}" debe tener entre ${min} y ${max} caracteres`);
  }
  return limpio;
}

function entero(valor, campo, { opcional = false, min = 1 } = {}) {
  if (valor === undefined || valor === null || valor === '') {
    if (opcional) return null;
    throw new ErrorApi(400, `El campo "${campo}" es obligatorio`);
  }
  const n = Number(valor);
  if (!Number.isInteger(n) || n < min) throw new ErrorApi(400, `El campo "${campo}" debe ser un número entero válido`);
  return n;
}

module.exports = { esCorreo, esTelefono, esClaveSegura, texto, entero };
