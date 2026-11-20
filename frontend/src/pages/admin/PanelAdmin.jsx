import { useState } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import { api } from '../../api.js';
import { Cargando, MensajeError, Vacio } from '../../components/Estado.jsx';
import { useDatos } from '../../hooks.js';
import { useSesion } from '../../sesion.jsx';
import { fecha, fotoProducto, pesos } from '../../util.js';
import { colorEstado } from '../MisSolicitudes.jsx';

const pestana = ({ isActive }) => `-mb-0.5 border-b-4 px-4 py-2 font-titulo text-xl font-bold ${isActive ? 'border-naranja text-verde-osc' : 'border-transparent text-suave hover:text-verde-osc'}`;

function Cifra({ titulo, valor, detalle }) {
  return (
    <div className="border-l-[6px] border-naranja bg-verde-fondo/50 p-4">
      <p className="text-sm font-semibold uppercase tracking-wide text-suave">{titulo}</p>
      <p className="font-titulo text-4xl font-bold text-verde-osc">{valor}</p>
      {detalle && <p className="text-sm text-suave">{detalle}</p>}
    </div>
  );
}

function Reportes() {
  const { datos: r, error, cargando, recargar } = useDatos('/admin/reportes');
  if (cargando) return <Cargando />;
  if (error) return <MensajeError error={error} reintentar={recargar} />;
  const suma = (o) => Object.values(o || {}).reduce((a, b) => a + b, 0);
  const max = Math.max(1, ...r.productos_activos_por_categoria.map((c) => c.productos));
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Cifra titulo="Usuarios" valor={suma(r.usuarios)} detalle={`${r.usuarios.productor || 0} productores · ${r.usuarios.comprador || 0} compradores`} />
        <Cifra titulo="Productores" valor={r.productores.verificados + r.productores.pendientes} detalle={`${r.productores.verificados} verificados · ${r.productores.pendientes} pendientes`} />
        <Cifra titulo="Publicaciones activas" valor={r.productos_por_estado.activo || 0} detalle={`${suma(r.productos_por_estado)} en total`} />
        <Cifra titulo="Pedidos enviados" valor={r.pedidos_enviados.cantidad} detalle={`${pesos(r.pedidos_enviados.valor_total)} en total`} />
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-2xl text-verde-osc">Productos activos por categoría</h2>
          <ul className="grid gap-2">
            {r.productos_activos_por_categoria.map((c) => (
              <li key={c.categoria} className="grid grid-cols-[150px_1fr_2rem] items-center gap-2 text-sm">
                <span>{c.categoria}</span>
                <span className="h-4 bg-verde-fondo"><span className="block h-4 bg-verde-med" style={{ width: `${(c.productos / max) * 100}%` }} /></span>
                <strong className="text-right">{c.productos}</strong>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="mb-3 text-2xl text-verde-osc">Solicitudes de contacto</h2>
          <table className="tabla">
            <tbody>
              {['pendiente', 'atendida', 'cerrada'].map((e) => (
                <tr key={e}><td><span className={`chip ${colorEstado[e]}`}>{e}</span></td><td className="text-right font-bold">{r.solicitudes_por_estado[e] || 0}</td></tr>
              ))}
              <tr><td className="font-bold">Total</td><td className="text-right font-bold">{suma(r.solicitudes_por_estado)}</td></tr>
            </tbody>
          </table>
        </section>
      </div>
    </>
  );
}

function Productores() {
  const { avisar } = useSesion();
  const [filtro, setFiltro] = useState('');
  const { datos, error, cargando, recargar } = useDatos(`/admin/productores${filtro !== '' ? `?verificado=${filtro}` : ''}`);
  async function verificar(p, valor) {
    try { await api(`/admin/productores/${p.id_productor}/verificar`, { metodo: 'PATCH', cuerpo: { verificado: valor } }); avisar(valor ? `Finca ${p.nombre_finca} verificada` : 'Verificación retirada'); recargar(); }
    catch (e) { avisar(e.message, 'error'); }
  }
  return (
    <>
      <label className="campo mb-4 max-w-xs">Mostrar
        <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          <option value="">Todos</option><option value="0">Pendientes de verificar</option><option value="1">Verificados</option>
        </select>
      </label>
      {cargando && <Cargando />}
      <MensajeError error={error} reintentar={recargar} />
      {datos && (datos.productores.length === 0 ? <Vacio>No hay productores en esta lista.</Vacio> : (
        <div className="overflow-x-auto">
          <table className="tabla">
            <thead><tr><th>Finca</th><th>Productor y contacto</th><th>Ubicación</th><th>Productos</th><th>Registro</th><th>Estado</th></tr></thead>
            <tbody>
              {datos.productores.map((p) => (
                <tr key={p.id_productor}>
                  <td className="font-semibold">{p.nombre_finca}<br /><span className="text-sm font-normal text-suave">{p.cultivos}</span></td>
                  <td>{p.nombre}<br /><span className="text-sm text-suave">{p.telefono || ''} {p.correo || ''}</span></td>
                  <td>{p.vereda}, {p.municipio}</td>
                  <td className="text-center">{p.productos}</td>
                  <td className="whitespace-nowrap">{fecha(p.fecha_registro)}</td>
                  <td>{p.verificado
                    ? <button className="btn btn-claro btn-peq" onClick={() => verificar(p, false)}>✓ Verificado · Retirar</button>
                    : <button className="btn btn-peq" onClick={() => verificar(p, true)}>Verificar</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </>
  );
}

function Publicaciones() {
  const { avisar } = useSesion();
  const [filtro, setFiltro] = useState('');
  const { datos, error, cargando, recargar } = useDatos(`/admin/productos${filtro ? `?estado=${filtro}` : ''}`);
  async function moderar(p, ocultar) {
    if (ocultar && !window.confirm(`¿Ocultar "${p.nombre}" del catálogo?`)) return;
    try { await api(`/admin/productos/${p.id_producto}/moderar`, { metodo: 'PATCH', cuerpo: { oculto: ocultar } }); avisar(ocultar ? 'Publicación ocultada' : 'Publicación visible de nuevo'); recargar(); }
    catch (e) { avisar(e.message, 'error'); }
  }
  return (
    <>
      <label className="campo mb-4 max-w-xs">Estado
        <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          <option value="">Todos</option>{['activo', 'pausado', 'agotado', 'oculto'].map((e) => <option key={e}>{e}</option>)}
        </select>
      </label>
      {cargando && <Cargando />}
      <MensajeError error={error} reintentar={recargar} />
      {datos && (datos.productos.length === 0 ? <Vacio>No hay publicaciones en este estado.</Vacio> : (
        <div className="overflow-x-auto">
          <table className="tabla">
            <thead><tr><th>Producto</th><th>Finca</th><th>Precio</th><th>Estado</th><th>Moderación</th></tr></thead>
            <tbody>
              {datos.productos.map((p) => (
                <tr key={p.id_producto}>
                  <td><div className="flex items-center gap-2"><img src={fotoProducto(p)} alt="" className="h-10 w-10 object-cover" /><span className="font-semibold">{p.nombre}</span></div><span className="text-sm text-suave">{p.categoria}</span></td>
                  <td>{p.nombre_finca}</td>
                  <td>{pesos(p.precio_unitario)} / {p.unidad}</td>
                  <td><span className={`chip ${colorEstado[p.estado]}`}>{p.estado}</span></td>
                  <td>{p.estado === 'oculto'
                    ? <button className="btn btn-claro btn-peq" onClick={() => moderar(p, false)}>Mostrar</button>
                    : <button className="btn btn-claro btn-peq" onClick={() => moderar(p, true)}>Ocultar</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </>
  );
}

function CargarPrecios() {
  const { avisar } = useSesion();
  const [archivo, setArchivo] = useState(null);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const precios = useDatos('/precios');
  async function enviar(e) {
    e.preventDefault(); setError(null); setEnviando(true);
    const d = new FormData(); d.append('archivo', archivo);
    try { const r = await api('/precios/csv', { metodo: 'POST', cuerpo: d }); avisar(r.mensaje); setArchivo(null); e.target.reset(); precios.recargar(); }
    catch (err) { setError(err); } finally { setEnviando(false); }
  }
  const ejemplo = 'producto;categoria;valor_kg;fecha;fuente\nTomate chonto;Verduras;3500;2026-10-16;SIPSA-DANE\n';
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={enviar} className="grid content-start gap-3">
        <p>Cargue el archivo CSV con los precios mayoristas del boletín SIPSA del DANE. Columnas: <code>producto, categoria, valor_kg, fecha</code> y, si quiere, <code>fuente</code>. Separador coma o punto y coma; fecha en formato AAAA-MM-DD.</p>
        <a className="text-sm font-bold text-naranja-osc underline" download="precios_ejemplo.csv" href={`data:text/csv;charset=utf-8,${encodeURIComponent(ejemplo)}`}>Descargar archivo de ejemplo</a>
        <label className="campo">Archivo CSV<input type="file" accept=".csv,text/csv" onChange={(e) => setArchivo(e.target.files?.[0] || null)} required /></label>
        <MensajeError error={error} />
        <button className="btn" disabled={!archivo || enviando}>{enviando ? 'Cargando…' : 'Cargar precios'}</button>
        <p className="text-sm text-suave">Si alguna fila tiene errores no se carga ninguna, y se indica la línea con el problema.</p>
      </form>
      <section>
        <h2 className="mb-3 text-2xl text-verde-osc">Precios vigentes</h2>
        {precios.datos && (
          <table className="tabla">
            <thead><tr><th>Producto</th><th>Precio (kg)</th><th>Fecha</th></tr></thead>
            <tbody>{precios.datos.precios.map((p) => <tr key={p.nombre_producto}><td>{p.nombre_producto}</td><td>{pesos(p.valor_kg)}</td><td>{fecha(p.fecha_dato)}</td></tr>)}</tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default function PanelAdmin() {
  return (
    <div className="contenedor py-10">
      <h1 className="text-4xl text-verde-osc">Administración</h1>
      <nav className="my-6 flex flex-wrap border-b-2 border-verde-fondo" aria-label="Secciones de administración">
        <NavLink to="/admin" end className={pestana}>Reportes</NavLink>
        <NavLink to="/admin/productores" className={pestana}>Productores</NavLink>
        <NavLink to="/admin/publicaciones" className={pestana}>Publicaciones</NavLink>
        <NavLink to="/admin/precios" className={pestana}>Precios SIPSA</NavLink>
      </nav>
      <Routes>
        <Route index element={<Reportes />} />
        <Route path="productores" element={<Productores />} />
        <Route path="publicaciones" element={<Publicaciones />} />
        <Route path="precios" element={<CargarPrecios />} />
      </Routes>
    </div>
  );
}
