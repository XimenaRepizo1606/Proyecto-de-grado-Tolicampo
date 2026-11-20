import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';

// Carga datos de la API y expone { datos, error, cargando, recargar }
export function useDatos(ruta) {
  const [estado, setEstado] = useState({ datos: null, error: null, cargando: true });
  const cargar = useCallback(() => {
    if (!ruta) return;
    setEstado((e) => ({ ...e, cargando: true, error: null }));
    api(ruta).then((datos) => setEstado({ datos, error: null, cargando: false }))
      .catch((error) => setEstado({ datos: null, error, cargando: false }));
  }, [ruta]);
  useEffect(() => { cargar(); }, [cargar]);
  return { ...estado, recargar: cargar };
}

// Categorías y veredas cambian poco: se piden una sola vez
const memoria = {};
export function useCatalogo(nombre) {
  const [lista, setLista] = useState(memoria[nombre] || []);
  useEffect(() => {
    if (memoria[nombre]) return;
    api('/' + nombre).then((d) => { memoria[nombre] = d[nombre]; setLista(d[nombre]); }).catch(() => {});
  }, [nombre]);
  return lista;
}
