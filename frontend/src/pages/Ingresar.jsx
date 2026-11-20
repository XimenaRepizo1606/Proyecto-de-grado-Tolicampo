import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { MensajeError } from '../components/Estado.jsx';
import { useSesion } from '../sesion.jsx';

export const inicioPorRol = { productor: '/productor', admin: '/admin', comprador: '/catalogo' };

export default function Ingresar() {
  const { iniciar, avisar } = useSesion();
  const navegar = useNavigate();
  const { state } = useLocation();
  const [datos, setDatos] = useState({ usuario: '', contrasena: '' });
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [ver, setVer] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setError(null); setEnviando(true);
    try {
      const r = await api('/auth/login', { metodo: 'POST', cuerpo: { usuario: datos.usuario.trim(), contrasena: datos.contrasena } });
      iniciar(r);
      avisar(`Bienvenido, ${r.usuario.nombre.split(' ')[0]}`);
      navegar(state?.desde || inicioPorRol[r.usuario.rol] || '/', { replace: true });
    } catch (err) { setError(err); } finally { setEnviando(false); }
  }

  return (
    <div className="contenedor grid max-w-md py-12">
      <div className="border-t-[6px] border-naranja bg-white p-6 shadow-[0_10px_30px_rgba(20,71,42,.15)]">
        <h1 className="text-4xl text-verde-osc">Ingresar</h1>
        {state?.motivo && <p className="mt-2 bg-verde-fondo/60 p-2 text-sm">{state.motivo}</p>}
        <form onSubmit={enviar} className="mt-4 grid gap-4">
          <label className="campo">Correo o celular
            <input autoComplete="username" value={datos.usuario} onChange={(e) => setDatos({ ...datos, usuario: e.target.value })} required placeholder="correo@ejemplo.com o 3001234567" />
          </label>
          <label className="campo">Contraseña
            <div className="flex">
              <input type={ver ? 'text' : 'password'} autoComplete="current-password" value={datos.contrasena} onChange={(e) => setDatos({ ...datos, contrasena: e.target.value })} required />
              <button type="button" className="border-2 border-l-0 border-verde-cla/70 px-3 text-sm text-suave" onClick={() => setVer(!ver)} aria-label={ver ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{ver ? 'Ocultar' : 'Ver'}</button>
            </div>
          </label>
          <MensajeError error={error} />
          <button className="btn" disabled={enviando}>{enviando ? 'Ingresando…' : 'Ingresar'}</button>
        </form>
        <p className="mt-4 text-center text-suave">¿No tiene cuenta? <Link to="/registro" className="font-bold text-naranja-osc underline">Regístrese</Link></p>
      </div>
    </div>
  );
}
