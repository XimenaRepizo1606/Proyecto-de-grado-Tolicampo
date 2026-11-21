import { urlFoto } from './api.js';

export const pesos = (n) => (n === null || n === undefined || n === '' ? '—'
  : '$' + Math.round(Number(n)).toLocaleString('es-CO'));

export const fecha = (f) => {
  if (!f) return '—';
  const d = /^\d{4}-\d{2}-\d{2}$/.test(f) ? new Date(f + 'T12:00:00') : new Date(f);
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Imagen de cada categoría (fotos del prototipo de ToliCampo). Se usa si el producto no tiene foto.
const IMAGEN_CATEGORIA = {
  Verduras: '/imagenes/tomate.jpg',
  Hortalizas: '/imagenes/cebolla_roja.jpg',
  Granos: '/imagenes/legumbres.jpg',
  Frutas: '/imagenes/fresas.jpg',
  'Cárnicos': '/imagenes/carnes.jpg',
  'Lácteos, quesos y huevos': '/imagenes/leche.jpg',
  'Pulpas de fruta': '/imagenes/pulpas_de_frutas.jpg',
};
export const imagenCategoria = (cat) => IMAGEN_CATEGORIA[cat] || '/imagenes/banner.jpg';

// Fotos de referencia que sí corresponden al producto (se buscan por el nombre)
const IMAGEN_POR_NOMBRE = [
  [/pulpa/i, '/imagenes/pulpas_de_frutas.jpg'],
  [/tomate/i, '/imagenes/tomate.jpg'],
  [/fresa/i, '/imagenes/fresas.jpg'],
  [/lenteja|fr[ií]jol|arveja|garbanzo/i, '/imagenes/legumbres.jpg'],
  [/cebolla (roja|cabezona)/i, '/imagenes/cebolla_roja.jpg'],
  [/leche|queso|cuajada|huevo/i, '/imagenes/leche.jpg'],
  [/carne|res\b|cerdo|pollo/i, '/imagenes/carnes.jpg'],
];

// Imagen neutra con el nombre del producto, para no mostrar la foto de otro alimento
const COLOR_CATEGORIA = {
  Verduras: '#2e7d3f', Hortalizas: '#4f8a2e', Granos: '#8a6a2e', Frutas: '#c94f0a',
  'Cárnicos': '#8a2e2e', 'Lácteos, quesos y huevos': '#5a6a5d', 'Pulpas de fruta': '#d9831f',
};
const escapar = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function imagenSinFoto(p) {
  const color = COLOR_CATEGORIA[p.categoria] || '#14472a';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#c2d99e"/>` +
    `<circle cx="200" cy="118" r="52" fill="${color}"/>` +
    `<path d="M200 150c0-38 20-62 52-70-4 34-22 58-52 70zm0 0c0-30-16-50-42-56 3 27 17 46 42 56z" fill="#fff"/>` +
    `<text
