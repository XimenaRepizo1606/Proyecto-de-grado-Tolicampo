// Cliente de la API REST de ToliCampo. La dirección sale de la variable VITE_API_URL.
// En la versión publicada, si Vercel no tiene la variable, se usa la API de Railway
const API_RAILWAY = 'https://proyecto-de-grado-tolicampo-production.up.railway.app/api';
export const API = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? API_RAILWAY : 'http://localhost:3000/api')).trim().replace(/\/$/, '');
const ORIGEN_API = API.replace(/\/api$/, '');

let token = null;
try { token = localStorage.getItem('tc_token'); } catch { /* navegador sin almacenamiento */ }

export function guardarToken(t) {
  token = t;
  try { t ? localStorage.setItem('tc_token', t) : localStorage.removeItem('tc_token'); } catch { /* sin almacenamiento */ }
}
export const hayToken = () => !!token;

export class ErrorApi extends Error {
  constructor(estado, mensaje, detalles) { super(mensaje); this.estado = estado; this.detalles = detalles; }
}

// Llama a la API. Si el cuerpo es FormData (fotos o CSV) se envía tal cual.
export async function api(ruta, { metodo = 'GET', cuerpo } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const esForm = typeof FormData !== 'undefined' && cuerpo instanceof FormData;
  if (cuerpo && !esForm) headers['Content-Type'] = 'application/json';
  let r;
  try {
    r = await fetch(API + ruta, { method: metodo, headers, body: cuerpo ? (esForm ? cuerpo : JSON.stringify(cuerpo)) : undefined });
  } catch {
    throw new ErrorApi(0, 'No hay conexión con el servidor. Revise su internet e intente de nuevo.');
  }
  let datos = null;
  try { datos = await r.json(); } catch { /* respuesta sin JSON */ }
  if (!r.ok) {
    if (r.status === 401 && token && ruta !== '/auth/login') {
      guardarToken(null);
      window.dispatchEvent(new Event('tc-sesion-vencida'));
    }
    throw new ErrorApi(r.status, datos?.error || 'Ocurrió un error. Intente de nuevo.', datos?.detalles);
  }
  return datos;
}

// Las fotos se guardan en la API como /uploads/archivo.jpg
export const urlFoto = (foto) => (!foto ? null : /^https?:/.test(foto) ? foto : ORIGEN_API + foto);
