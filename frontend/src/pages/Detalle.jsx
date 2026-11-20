import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { Cargando, MensajeError } from '../components/Estado.jsx';
import { useDatos } from '../hooks.js';
import { useSesion } from '../sesion.jsx';
import { fecha, finca, fotoProducto, pesos } from '../util.js';

export default function Detalle() {
  const { id } = useParams();
  const { usuario, avisar, actualizarCarrito } = useSesion();
  const navegar = useNavigate();
  const { datos, error, cargando } = useDatos(`/productos/${id}`);
  const p = datos?.producto;
  const perfil = useDatos(p ? `/productores/${p.id_productor}` : null);
  const [unidad, setUnidad] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [enlace, setEnlace] = useState(null);

  if (cargando) return <div className="contenedor"><Cargando /></div>;
  if (error) return <div className="contenedor py-10"><MensajeError error={error} /><Link to="/catalogo" className="btn">Volver al catálogo</Link></div>;

  const u = unidad || p.unidad;
  const precio = u === 'libra' && p.unidad === 'kilo' ? p.precio_libra : p.precio_final;
  const disponible = p.estado === 'activo';
  const diferencia = p.precio_referencia_kg && p.unidad === 'kilo' ? p.precio_final - p.precio_referencia_kg : null;

  function exigirComprador() {
    if (!usuario) { navegar('/ingresar', { state: { desde: `/producto/${id}`, motivo: 'Ingrese como comprador para contactar al productor.' } }); return false; }
    if (usuario.rol !== 'comprador') { avisar('Esta opción es para cuentas de comprador.', 'error'); return false; }
    return true;
  }

  async function agregar() {
    if (!exigirComprador()) return;
    setOcupado(true);
    try {
      await api('/carrito/items', { metodo: 'POST', cuerpo: { id_producto: p.id_producto, cantidad: Number(cantidad), unidad: u } });
      await actualizarCarrito();
      avisar(`${p.nombre} agregado al carrito`);
    } catch (e) { avisar(e.message, 'error'); } finally { setOcupado(false); }
  }

  async function contactar(e) {
    e.preventDefault();
    if (!exigirComprador()) return;
    setOcupado(true);
    try {
      const r = await api('/solicitudes', { metodo: 'POST', cuerpo: { id_producto: p.id_producto, cantidad: Number(cantidad), mensaje: mensaje.trim() || undefined } });
      setEnlace(r.enlace_whatsapp);
      avisar('Solicitud registrada. Abriendo WhatsApp…');
      window.open(r.enlace_whatsapp, '_blank', 'noopener');
    } catch (err) { avisar(err.message, 'error'); } finally { setOcupado(false); }
  }

  return (
    <div className="contenedor py-8">
      <nav className="mb-4 text-sm text-suave" aria-label="Ruta">
        <Link to="/catalogo" className="hover:underline">Catálogo</Link> › <Link to={`/catalogo?categoria=${p.id_categoria}`} className="hover:underline">{p.categoria}</Link> › {p.nombre}
      </nav>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative">
          <img src={fotoProducto(p)} alt={p.nombre} className="aspect-[4/3] w-full border-2 border-verde-fondo object-cover" />
          {p.descuento_pct > 0 && <span className="absolute left-3 top-3 bg-naranja px-3 py-1 font-bold text-white">-{Math.round(p.descuento_pct)}%</span>}
          {!p.foto_url && <p className="mt-1 text-xs text-suave">Imagen de referencia de la categoría.</p>}
        </div>

        <div>
          <p className="chip bg-verde-fondo text-verde-osc">{p.categoria}</p>
          <h1 className="mt-2 text-5xl leading-none text-verde-osc">{p.nombre}</h1>
          <p className="mt-2 text-lg">
            <strong>{finca(p.nombre_finca)}</strong> · {p.municipio}, Tolima{' '}
            {p.verificado ? <span className="font-bold text-verde-med">✓ Productor verificado</span> : <span className="font-bold text-naranja-osc">Verificación pendiente</span>}
          </p>
          {!disponible && <p className="mt-3 border-l-4 border-naranja-osc bg-orange-50 p-3 font-semibold text-naranja-osc">Este producto está {p.estado} por ahora.</p>}

          <div className="my-5 border-y-2 border-verde-fondo py-4">
            <p className="text-3xl font-bold text-naranja-osc">
              {p.descuento_pct > 0 && <span className="mr-2 text-lg font-normal text-suave line-through">{pesos(p.precio_unitario)}</span>}
              {pesos(p.precio_final)} <small className="text-lg font-normal text-suave">/ {p.unidad}</small>
            </p>
            {p.precio_libra && <p className="text-suave">{pesos(p.precio_libra)} / libra</p>}
            <p className="text-sm text-suave">Disponibles: {Number(p.cantidad_disponible).toLocaleString('es-CO')} {p.unidad}(s)</p>
            {p.precio_referencia_kg && (
              <p className="mt-2 bg-verde-fondo/50 p-2 text-sm">
                Precio mayorista de referencia (SIPSA, {fecha(p.fecha_referencia)}): <strong>{pesos(p.precio_referencia_kg)} / kg</strong>
                {diferencia !== null && <> · {diferencia > 0 ? `${pesos(diferencia)} por encima` : diferencia < 0 ? `${pesos(-diferencia)} por debajo` : 'igual'} del mayorista</>}
              </p>
            )}
          </div>

          {disponible && (
            <form onSubmit={contactar} className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="campo">Cantidad
                  <input type="number" min="0.5" step="0.5" inputMode="decimal" value={cantidad} onChange={(e) => setCantidad(e.target.value)} required />
                </label>
                <label className="campo">Unidad
                  <select value={u} onChange={(e) => setUnidad(e.target.value)} disabled={p.unidad !== 'kilo'}>
                    <option value={p.unidad}>{p.unidad}</option>
                    {p.unidad === 'kilo' && <option value="libra">libra</option>}
                  </select>
                </label>
              </div>
              <p className="font-semibold text-verde-osc">Total aproximado: {pesos(precio * Number(cantidad || 0))}</p>
              <label className="campo">Mensaje para el productor (opcional)
                <textarea rows="2" maxLength="500" value={mensaje} onChange={(e) => setMensaje(e.target.value)} placeholder="Ej.: ¿Puede entregar el sábado en el barrio Belén?" />
              </label>
              <div className="flex flex-wrap gap-3">
                <button type="submit" className="btn flex-1" disabled={ocupado}>Contactar por WhatsApp</button>
                <button type="button" className="btn btn-claro flex-1" onClick={agregar} disabled={ocupado}>Agregar al carrito</button>
              </div>
              {enlace && <p className="text-sm">Si WhatsApp no se abrió, <a href={enlace} target="_blank" rel="noopener noreferrer" className="font-bold text-verde-med underline">toque aquí</a>.</p>}
              <p className="text-sm text-suave">El pago y la entrega se acuerdan directamente con el productor. ToliCampo no cobra comisión.</p>
            </form>
          )}
        </div>
      </div>

      {perfil.datos && (
        <section className="mt-10 border-l-[6px] border-naranja bg-verde-fondo/60 p-5">
          <h2 className="text-3xl text-verde-osc">Sobre {finca(perfil.datos.perfil.nombre_finca).replace(/^Finca/, "la finca")}</h2>
          <p className="text-suave">Vereda {perfil.datos.perfil.vereda}, {perfil.datos.perfil.municipio} · Cultivos: {perfil.datos.perfil.cultivos}</p>
          {perfil.datos.perfil.descripcion && <p className="mt-2">{perfil.datos.perfil.descripcion}</p>}
          <Link to={`/catalogo?q=${encodeURIComponent(perfil.datos.perfil.nombre_finca)}`} className="mt-3 inline-block font-bold text-naranja-osc underline">Ver más productos de esta finca</Link>
        </section>
      )}
    </div>
  );
}
