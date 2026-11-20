import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { Cargando, MensajeError, Vacio } from '../components/Estado.jsx';
import { useSesion } from '../sesion.jsx';
import { finca, fotoProducto, pesos } from '../util.js';

export default function Carrito() {
  const { avisar, actualizarCarrito } = useSesion();
  const [carrito, setCarrito] = useState(null);
  const [error, setError] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [enviado, setEnviado] = useState(null);

  useEffect(() => { api('/carrito').then(setCarrito).catch(setError); }, []);

  async function accion(ruta, opciones, exito) {
    setOcupado(true); setError(null);
    try {
      const c = await api(ruta, opciones);
      setCarrito(c); await actualizarCarrito();
      if (exito) avisar(exito);
    } catch (e) { setError(e); } finally { setOcupado(false); }
  }
  const cambiarCantidad = (i, n) => n > 0 && accion(`/carrito/items/${i.id_detalle}`, { metodo: 'PATCH', cuerpo: { cantidad: n } });
  const quitar = (i) => accion(`/carrito/items/${i.id_detalle}`, { metodo: 'DELETE' }, `${i.nombre} quitado del carrito`);
  const vaciar = () => window.confirm('¿Vaciar el carrito?') && accion('/carrito', { metodo: 'DELETE' }, 'Carrito vacío');

  async function enviar() {
    setOcupado(true); setError(null);
    try {
      const r = await api('/carrito/enviar', { metodo: 'POST' });
      setEnviado(r); await actualizarCarrito();
      if (r.enlaces.length === 1) window.open(r.enlaces[0].enlace_whatsapp, '_blank', 'noopener');
    } catch (e) { setError(e); } finally { setOcupado(false); }
  }

  if (enviado) {
    return (
      <div className="contenedor max-w-2xl py-10">
        <h1 className="text-4xl text-verde-osc">Pedido #{enviado.id_pedido} enviado</h1>
        <p className="my-3">{enviado.mensaje} Toque cada botón para enviar el mensaje por WhatsApp a la finca.</p>
        <ul className="grid gap-3">
          {enviado.enlaces.map((e) => (
            <li key={e.id_productor} className="flex flex-wrap items-center justify-between gap-3 border-2 border-verde-fondo p-4">
              <div><strong className="text-verde-osc">{finca(e.finca)}</strong><br /><span className="text-suave">Total aproximado {pesos(e.total)}</span></div>
              <a href={e.enlace_whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-peq">Escribir por WhatsApp</a>
            </li>
          ))}
        </ul>
        <p className="mt-4 font-bold text-verde-osc">Total del pedido: {pesos(enviado.total)}</p>
        <div className="mt-6 flex gap-3"><Link to="/mis-solicitudes" className="btn btn-claro">Ver mis pedidos</Link><Link to="/catalogo" className="btn">Seguir comprando</Link></div>
      </div>
    );
  }

  return (
    <div className="contenedor max-w-4xl py-10">
      <h1 className="titulo-seccion">Tu carrito</h1>
      {!carrito && !error && <Cargando />}
      <MensajeError error={error} />
      {carrito && (carrito.items.length === 0
        ? <><Vacio>Aún no ha agregado productos.</Vacio><Link to="/catalogo" className="btn mt-4">Ir al catálogo</Link></>
        : (
          <>
            <div className="overflow-x-auto">
              <table className="tabla">
                <thead><tr><th>Producto</th><th>Cantidad</th><th>Precio</th><th>Subtotal</th><th><span className="sr-only">Quitar</span></th></tr></thead>
                <tbody>
                  {carrito.items.map((i) => (
                    <tr key={i.id_detalle} className={i.estado_producto !== 'activo' ? 'opacity-60' : ''}>
                      <td>
                        <div className="flex items-center gap-3">
                          <img src={fotoProducto(i)} alt="" className="h-12 w-12 object-cover" />
                          <div><Link to={`/producto/${i.id_producto}`} className="font-semibold text-verde-osc hover:underline">{i.nombre}</Link><br /><span className="text-sm text-suave">{finca(i.nombre_finca)}</span>
                            {i.estado_producto !== 'activo' && <><br /><span className="text-sm font-bold text-naranja-osc">Ya no está disponible</span></>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <button aria-label={`Quitar una unidad de ${i.nombre}`} disabled={ocupado || Number(i.cantidad) <= 1} onClick={() => cambiarCantidad(i, Number(i.cantidad) - 1)} className="h-7 w-7 rounded-full border-2 border-verde-med font-bold text-verde-osc disabled:opacity-40">−</button>
                          <span className="min-w-[4.5rem] text-center">{Number(i.cantidad)} {i.unidad}</span>
                          <button aria-label={`Agregar una unidad de ${i.nombre}`} disabled={ocupado} onClick={() => cambiarCantidad(i, Number(i.cantidad) + 1)} className="h-7 w-7 rounded-full border-2 border-verde-med font-bold text-verde-osc">+</button>
                        </div>
                      </td>
                      <td>{pesos(i.precio_unitario)}</td>
                      <td className="font-bold">{pesos(i.subtotal)}</td>
                      <td><button onClick={() => quitar(i)} disabled={ocupado} aria-label={`Quitar ${i.nombre}`} className="text-xl text-suave hover:text-naranja-osc">✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-suave">El pago y la entrega se acuerdan directamente con cada productor. Si el carrito tiene productos de varias fincas, se envía un mensaje a cada una.</p>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <strong className="text-2xl text-verde-osc">Total aproximado: {pesos(carrito.total)}</strong>
              <div className="flex gap-3">
                <button className="btn btn-claro" onClick={vaciar} disabled={ocupado}>Vaciar</button>
                <button className="btn" onClick={enviar} disabled={ocupado}>Enviar pedido por WhatsApp</button>
              </div>
            </div>
          </>
        ))}
    </div>
  );
}
