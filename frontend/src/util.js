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
export const fotoProducto = (p) => urlFoto(p.foto_url) || imagenCategoria(p.categoria);

export const DESCRIPCION_CATEGORIA = {
  Verduras: 'Colores y sabores de la huerta tolimense',
  Hortalizas: 'Cebolla, cilantro y más, recién cortados',
  Granos: 'Fríjol, lenteja y maíz de las fincas del sur del Tolima',
  Frutas: 'Dulces, jugosas y recién cosechadas',
  'Cárnicos': 'Res, cerdo y pollo de fincas aliadas',
  'Lácteos, quesos y huevos': 'Leche, quesos y huevos de finca',
  'Pulpas de fruta': 'Jugos naturales listos en segundos',
};

export const UNIDADES = ['kilo', 'libra', 'arroba', 'bulto'];

// Evita "Finca Finca de ejemplo" cuando el nombre ya empieza por "Finca"
export const finca = (n) => (/^finca\b/i.test(n || '') ? n : `Finca ${n}`);
