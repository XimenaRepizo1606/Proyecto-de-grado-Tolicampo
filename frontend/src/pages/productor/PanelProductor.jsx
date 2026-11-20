import { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes } from 'react-router-dom';
import { api } from '../../api.js';
import { Cargando, MensajeError, Vacio } from '../../components/Estado.jsx';
import { useCatalogo, useDatos } from '../../hooks.js';
import { useSesion } from '../../sesion.jsx';
import { fecha, fotoProducto, pesos } from '../../util.js';
import { colorEstado } from '../MisSolicitudes.jsx';

const pestana = ({ isActive }) => `-mb-0.5 border-b-4 px-4 py-2 font-titulo text-xl font-bold ${isActive ? 'border-naranja text-verde-osc' : 'border-transparent text-suave hover:text-verde-osc'}`;

function MisProductos() {
  const { avisar } = useSesion();
  const { datos, error, cargando, recargar } = useDatos('/productos/mios');
  async function estado(p, nuevo) {
    try { await api(`/productos/${p.id_producto}/estado`, { metodo: 'PATCH', cuerpo: { estado: nuevo } }); avisar(`${p.nombre}: ${nuevo}`); recargar(); }
    catch (e) { avisar(e.message, 'error'); }
  }
  if (cargando) return <Cargando />;
  return (
    <>
      <MensajeError error={error} reintentar={recargar} />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-suave">{datos?.productos.length || 0} publicaciones</p>
        <Link to="/productor/nuevo" className="btn">+ Publicar producto</Link>
      </div>
      {datos && (datos.productos.length === 0 ? <Vacio>Aún no ha publicado productos. Publique el primero en menos de un minuto.</Vacio> : (
        <ul className="grid gap-3">
          {datos.productos.map((p) => (
            <li key={p.id_producto} className="flex flex-wrap items-center gap-4 border-2 border-verde-fondo p-3">
              <img src={fotoProducto(p)} alt="" className="h-20 w-20 object-cover" />
              <div className="min-w-[180px] flex-1">
                <p className="font-titulo text-xl font-bold text-verde-osc">{p.nombre} <span className={`chip ml-1 align-middle ${colorEstado[p.estado]}`}>{p.estado}</span></p>
                <p className="text-sm text-suave">{p.categoria} · {Number(p.cantidad_disponible).toLocaleString('es-CO')} {p.unidad}(s) disponibles</p>
                <p className="font-bold text-naranja-osc">{pesos(p.precio_final)} / {p.unidad}{p.descuento_pct > 0 && <span className="ml-2 text-sm font-normal text-suave">({Math.round(p.descuento_pct)} % de descuento)</span>}</p>
              </div>
              {p.estado === 'oculto' ? (
                <p className="max-w-xs text-sm text-red-800">El administrador ocultó esta publicación. Comuníquese con ToliCampo.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Link to={`/productor/editar/${p.id_producto}`} className="btn btn-claro btn-peq">Editar</Link>
                  {p.estado === 'activo' && <button className="btn btn-claro btn-peq" onClick={() => estado(p, 'pausado')}>Pausar</button>}
                  {p.estado === 'activo' && <button className="btn btn-claro btn-peq" onClick={() => estado(p, 'agotado')}>Agotado</button>}
                  {p.estado !== 'activo' && <button className="btn btn-peq" onClick={() => estado(p, 'activo')}>Activar</button>}
                </div>
              )}
            </li>
          ))}
        </ul>
      ))}
    </>
  );
}

function Solicitudes() {
  const { avisar } = useSesion();
  const [filtro, setFiltro] = useState('');
  const { datos, error, cargando, recargar } = useDatos(`/solicitudes/recibidas${filtro ? `?estado=${filtro}` : ''}`);
  async function cambiar(s, estado) {
    try { await api(`/solicitudes/${s.id_solicitud}/estado`, { metodo: 'PATCH', cuerpo: { estado } }); avisar(`Solicitud marcada como ${estado}`); recargar(); }
    catch (e) { avisar(e.message, 'error'); }
  }
  return (
    <>
      <label className="campo mb-4 max-w-xs">Mostrar
        <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          <option value="">Todas</option><option value="pendiente">Pendientes</option><option value="atendida">Atendidas</option><option value="cerrada">Cerradas</option>
        </select>
      </label>
      {cargando && <Cargando />}
      <MensajeError error={error} reintentar={recargar} />
      {datos && (datos.solicitudes.length === 0 ? <Vacio>No tiene solicitudes {filtro && `en estado ${filtro}`}.</Vacio> : (
        <ul className="grid gap-3">
          {datos.solicitudes.map((s) => (
            <li key={s.id_solicitud} className="border-2 border-verde-fondo p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-titulo text-xl font-bold text-verde-osc">{s.producto}{s.cantidad && ` · ${Number(s.cantidad)} ${s.unidad}(s)`}</p>
                  <p className="text-sm text-suave">{s.comprador} · {s.telefono_comprador || s.correo_comprador} · {fecha(s.fecha_solicitud)}</p>
                  {s.mensaje && <p className="mt-1">“{s.mensaje}”</p>}
                </div>
                <span className={`chip ${colorEstado[s.estado]}`}>{s.estado}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {s.telefono_comprador && <a href={s.enlace_whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-peq">Responder por WhatsApp</a>}
                {s.estado === 'pendiente' && <button className="btn btn-claro btn-peq" onClick={() => cambiar(s, 'atendida')}>Marcar atendida</button>}
                {s.estado !== 'cerrada' && <button className="btn btn-claro btn-peq" onClick={() => cambiar(s, 'cerrada')}>Cerrar</button>}
              </div>
            </li>
          ))}
        </ul>
      ))}
    </>
  );
}

function Perfil() {
  const { avisar } = useSesion();
  const veredas = useCatalogo('veredas');
  const { datos, error, cargando } = useDatos('/productores/mi-perfil');
  const [f, setF] = useState(null);
  const [errorG, setErrorG] = useState(null);
  const [guardando, setGuardando] = useState(false);
  useEffect(() => {
    if (datos) { const p = datos.perfil; setF({ nombre_finca: p.nombre_finca, cultivos: p.cultivos, descripcion: p.descripcion || '', id_vereda: String(p.id_vereda) }); }
  }, [datos]);
  async function guardar(e) {
    e.preventDefault(); setErrorG(null); setGuardando(true);
    try { await api('/productores/mi-perfil', { metodo: 'PUT', cuerpo: { ...f, id_vereda: Number(f.id_vereda) } }); avisar('Perfil actualizado'); }
    catch (err) { setErrorG(err); } finally { setGuardando(false); }
  }
  if (cargando || !f) return <><Cargando /><MensajeError error={error} /></>;
  const cambiar = (c) => (e) => setF({ ...f, [c]: e.target.value });
  return (
    <form onSubmit={guardar} className="grid max-w-xl gap-3">
      <p className={datos.perfil.verificado ? 'font-bold text-verde-med' : 'font-bold text-naranja-osc'}>
        {datos.perfil.verificado ? '✓ Su finca está verificada por ToliCampo' : 'Su finca está pendiente de verificación por el administrador'}
      </p>
      <label className="campo">Nombre de la finca<input value={f.nombre_finca} onChange={cambiar('nombre_finca')} required minLength="2" maxLength="100" /></label>
      <label className="campo">Vereda
        <select value={f.id_vereda} onChange={cambiar('id_vereda')} required>
          {veredas.map((v) => <option key={v.id_vereda} value={v.id_vereda}>{v.municipio} – {v.nombre}</option>)}
        </select>
      </label>
      <label className="campo">Cultivos<input value={f.cultivos} onChange={cambiar('cultivos')} required minLength="2" maxLength="255" /></label>
      <label className="campo">Descripción de la finca (la ven los compradores)<textarea rows="4" maxLength="1000" value={f.descripcion} onChange={cambiar('descripcion')} placeholder="Cuente cómo cultiva, desde cuándo, si hace entregas en Ibagué…" /></label>
      <MensajeError error={errorG} />
      <button className="btn" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar perfil'}</button>
    </form>
  );
}

export default function PanelProductor() {
  const { usuario } = useSesion();
  return (
    <div className="contenedor py-10">
      <h1 className="text-4xl text-verde-osc">Hola, {usuario.nombre.split(' ')[0]}</h1>
      <p className="text-suave">Panel del productor: publique sus productos y atienda a los compradores.</p>
      <nav className="my-6 flex flex-wrap border-b-2 border-verde-fondo" aria-label="Secciones del panel">
        <NavLink to="/productor" end className={pestana}>Mis productos</NavLink>
        <NavLink to="/productor/solicitudes" className={pestana}>Solicitudes</NavLink>
        <NavLink to="/productor/perfil" className={pestana}>Mi finca</NavLink>
      </nav>
      <Routes>
        <Route index element={<MisProductos />} />
        <Route path="solicitudes" element={<Solicitudes />} />
        <Route path="perfil" element={<Perfil />} />
      </Routes>
    </div>
  );
}
