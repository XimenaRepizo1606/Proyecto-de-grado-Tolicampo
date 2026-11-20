import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useSesion } from '../sesion.jsx';
import { finca, fotoProducto, pesos } from '../util.js';

// Tarjeta del catálogo, con el mismo diseño del prototipo: foto, descuento, finca, precio y compra rápida
export default function TarjetaProducto({ p }) {
  const { usuario, avisar, actualizarCarrito } = useSesion();
  const navegar = useNavigate();
  const [unidad, setUnidad] = useState(p.unidad);
  const [enviando, setEnviando] = useState(false);
  const porLibra = p.unidad === 'kilo';
  const precio = unidad === 'libra' && porLibra ? p.precio_libra : p.precio_final;

  async function agregar() {
    if (!usuario) { navegar('/ingresar', { state: { desde: `/producto/${p.id_producto}`, motivo: 'Ingrese como comprador para usar el carrito.' } }); return; }
    if (usuario.rol !== 'comprador') { avisar('El carrito es para cuentas de comprador.', 'error'); return; }
    setEnviando(true);
    try {
      await api('/carrito/items', { metodo: 'POST', cuerpo: { id_producto: p.id_producto, cantidad: 1, unidad } });
      await actualizarCarrito();
      avisar(`${p.nombre} agregado al carrito`);
    } catch (e) { avisar(e.message, 'error'); } finally { setEnviando(false); }
  }

  return (
    <article className="tarjeta">
      <Link to={`/producto/${p.id_producto}`} className="relative block h-48 overflow-hidden bg-verde-fondo">
        <img src={fotoProducto(p)} alt={p.nombre} loading="lazy" className="h-full w-full object-cover" />
        {p.descuento_pct > 0 && <span className="absolute left-2.5 top-2.5 bg-naranja px-2.5 py-0.5 text-sm font-bold text-white">-{Math.round(p.descuento_pct)}%</span>}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="text-[1.35rem] leading-tight text-verde-osc"><Link to={`/producto/${p.id_producto}`} className="hover:underline">{p.nombre}</Link></h3>
        <p className="text-sm text-suave">
          {finca(p.nombre_finca)} · {p.municipio}, Tolima
          {p.verificado ? <span className="ml-1 font-bold text-verde-med">✓ Verificado</span> : null}
        </p>
        <p className="text-lg font-bold text-naranja-osc">
          {p.descuento_pct > 0 && <span className="mr-1 text-sm font-normal text-suave line-through">{pesos(p.precio_unitario)}</span>}
          {pesos(p.precio_final)} <small className="font-normal text-suave">/ {p.unidad}</small>
        </p>
        {porLibra && <p className="text-sm text-suave">{pesos(p.precio_libra)} / libra</p>}
        <div className="mt-auto flex gap-2 pt-2">
          {porLibra && (
            <select aria-label={`Unidad para ${p.nombre}`} value={unidad} onChange={(e) => setUnidad(e.target.value)}
              className="border-2 border-verde-cla/70 bg-white px-2 py-1">
              <option value="kilo">Kilo</option>
              <option value="libra">Libra</option>
            </select>
          )}
          <button className="btn btn-peq flex-1" onClick={agregar} disabled={enviando}
            aria-label={`Agregar ${p.nombre} al carrito a ${pesos(precio)}`}>
            {enviando ? 'Agregando…' : 'Agregar al carrito'}
          </button>
        </div>
      </div>
    </article>
  );
}
