// Estado global: usuario con sesión, contador del carrito y avisos en pantalla.
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, guardarToken, hayToken } from './api.js';

const Ctx = createContext(null);
export const useSesion = () => useContext(Ctx);

export function SesionProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(hayToken());
  const [enCarrito, setEnCarrito] = useState(0);
  const [aviso, setAviso] = useState(null);

  const avisar = useCallback((texto, tipo = 'ok') => {
    setAviso({ texto, tipo, id: Date.now() });
  }, []);
  useEffect(() => {
    if (!aviso) return undefined;
    const t = setTimeout(() => setAviso(null), 4000);
    return () => clearTimeout(t);
  }, [aviso]);

  const actualizarCarrito = useCallback(async (u = usuario) => {
    if (u?.rol !== 'comprador') { setEnCarrito(0); return; }
    try { const c = await api('/carrito'); setEnCarrito(c.items.length); } catch { /* sin conexión */ }
  }, [usuario]);

  // Si hay un token guardado, recupera el usuario al abrir la aplicación
  useEffect(() => {
    if (!hayToken()) return;
    api('/auth/yo').then((d) => { setUsuario(d.usuario); actualizarCarrito(d.usuario); })
      .catch(() => guardarToken(null)).finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const vencida = () => { setUsuario(null); setEnCarrito(0); avisar('Su sesión terminó. Ingrese de nuevo.', 'error'); };
    window.addEventListener('tc-sesion-vencida', vencida);
    return () => window.removeEventListener('tc-sesion-vencida', vencida);
  }, [avisar]);

  const iniciar = (datos) => { guardarToken(datos.token); setUsuario(datos.usuario); actualizarCarrito(datos.usuario); };
  const salir = () => { guardarToken(null); setUsuario(null); setEnCarrito(0); };

  return (
    <Ctx.Provider value={{ usuario, cargando, iniciar, salir, enCarrito, actualizarCarrito, avisar, aviso }}>
      {children}
    </Ctx.Provider>
  );
}
