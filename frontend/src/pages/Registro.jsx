import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { MensajeError } from '../components/Estado.jsx';
import { useCatalogo } from '../hooks.js';
import { useSesion } from '../sesion.jsx';
import { inicioPorRol } from './Ingresar.jsx';

export default function Registro() {
  const [params] = useSearchParams();
  const [rol, setRol] = useState(params.get('rol') === 'productor' ? 'productor' : 'comprador');
  const veredas = useCatalogo('veredas');
  const municipios = useMemo(() => [...new Set(veredas.map((v) => v.municipio))].sort(), [veredas]);
  const [municipio, setMunicipio] = useState('');
  const [f, setF] = useState({ nombre: '', correo: '', telefono: '', contrasena: '', confirmar: '', nombre_finca: '', id_vereda: '', cultivos: '', acepta: false });
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const { iniciar, avisar } = useSesion();
  const navegar = useNavigate();
  const cambiar = (c) => (e) => setF({ ...f, [c]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  async function enviar(e) {
    e.preventDefault();
    setError(null);
    if (f.contrasena !== f.confirmar) { setError(new Error('Las contraseñas no coinciden.')); return; }
    if (!f.correo.trim() && !f.telefono.trim()) { setError(new Error('Escriba un correo o un número de celular.')); return; }
    const cuerpo = {
      nombre: f.nombre.trim(), rol, contrasena: f.contrasena, acepta_tratamiento_datos: f.acepta,
      correo: f.correo.trim() || undefined, telefono: f.telefono.replace(/\s/g, '') || undefined,
    };
    if (rol === 'productor') Object.assign(cuerpo, { nombre_finca: f.nombre_finca.trim(), id_vereda: Number(f.id_vereda), cultivos: f.cultivos.trim() });
    setEnviando(true);
    try {
      const r = await api('/auth/registro', { metodo: 'POST', cuerpo });
      iniciar(r);
      avisar('Cuenta creada. ¡Bienvenido a ToliCampo!');
      navegar(rol === 'productor' ? '/productor/nuevo' : inicioPorRol[rol], { replace: true });
    } catch (err) { setError(err); } finally { setEnviando(false); }
  }

  const pestana = (r, texto) => (
    <button type="button" role="tab" aria-selected={rol === r} onClick={() => setRol(r)}
      className={`-mb-0.5 flex-1 border-b-4 p-2 font-titulo text-xl font-bold ${rol === r ? 'border-naranja text-verde-osc' : 'border-transparent text-suave'}`}>{texto}</button>
  );

  return (
    <div className="contenedor max-w-xl py-10">
      <div className="border-t-[6px] border-naranja bg-white p-6 shadow-[0_10px_30px_rgba(20,71,42,.15)]">
        <h1 className="text-4xl text-verde-osc">Crea tu cuenta</h1>
        <div className="my-4 flex border-b-2 border-verde-fondo" role="tablist">
          {pestana('comprador', 'Soy comprador')}
          {pestana('productor', 'Soy productor')}
        </div>
        <form onSubmit={enviar} className="grid gap-3">
          <label className="campo">Nombre completo<input value={f.nombre} onChange={cambiar('nombre')} required minLength="3" maxLength="100" autoComplete="name" /></label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="campo">Celular{rol === 'productor' && ' (con WhatsApp)'}
              <input type="tel" inputMode="numeric" value={f.telefono} onChange={cambiar('telefono')} placeholder="3001234567" pattern="3[0-9]{9}" title="10 dígitos, empieza por 3" required={rol === 'productor'} autoComplete="tel" />
            </label>
            <label className="campo">Correo{rol === 'productor' && ' (opcional)'}
              <input type="email" value={f.correo} onChange={cambiar('correo')} autoComplete="email" />
            </label>
          </div>
          {rol === 'productor' && (
            <>
              <label className="campo">Nombre de la finca<input value={f.nombre_finca} onChange={cambiar('nombre_finca')} required minLength="2" maxLength="100" /></label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="campo">Municipio
                  <select value={municipio} onChange={(e) => { setMunicipio(e.target.value); setF({ ...f, id_vereda: '' }); }} required>
                    <option value="">Seleccione…</option>
                    {municipios.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </label>
                <label className="campo">Vereda
                  <select value={f.id_vereda} onChange={cambiar('id_vereda')} required disabled={!municipio}>
                    <option value="">Seleccione…</option>
                    {veredas.filter((v) => v.municipio === municipio).map((v) => <option key={v.id_vereda} value={v.id_vereda}>{v.nombre}</option>)}
                  </select>
                </label>
              </div>
              <label className="campo">¿Qué cultiva o produce?<input value={f.cultivos} onChange={cambiar('cultivos')} required minLength="2" maxLength="255" placeholder="Ej.: tomate, plátano, café" /></label>
            </>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="campo">Contraseña<input type="password" value={f.contrasena} onChange={cambiar('contrasena')} required minLength="8" autoComplete="new-password" /></label>
            <label className="campo">Repita la contraseña<input type="password" value={f.confirmar} onChange={cambiar('confirmar')} required minLength="8" autoComplete="new-password" /></label>
          </div>
          <p className="-mt-1 text-sm text-suave">Mínimo 8 caracteres, con letras y números.</p>
          <label className="flex items-start gap-2 text-[.95rem]">
            <input type="checkbox" checked={f.acepta} onChange={cambiar('acepta')} required className="mt-1.5" />
            <span>Autorizo el tratamiento de mis datos personales según la Ley 1581 de 2012. Mis datos solo se usan para el funcionamiento de ToliCampo y el contacto entre productores y compradores.</span>
          </label>
          <MensajeError error={error} />
          <button className="btn" disabled={enviando}>{enviando ? 'Creando cuenta…' : rol === 'productor' ? 'Registrar mi finca' : 'Crear cuenta de comprador'}</button>
        </form>
        <p className="mt-4 text-center text-suave">¿Ya tiene cuenta? <Link to="/ingresar" className="font-bold text-naranja-osc underline">Ingrese</Link></p>
      </div>
    </div>
  );
}
