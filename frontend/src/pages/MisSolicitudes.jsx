import { Link } from 'react-router-dom';
import { Cargando, MensajeError, Vacio } from '../components/Estado.jsx';
import { useDatos } from '../hooks.js';
import { fecha } from '../util.js';

export const colorEstado = {
  pendiente: 'bg-orange-100 text-naranja-osc', atendida: 'bg-verde-fondo text-verde-osc', cerrada: 'bg-gray-200 text-gray-700',
  activo: 'bg-verde-fondo text-verde-osc', pausado: 'bg-orange-100 text-naranja-osc', agotado: 'bg-gray-200 text-gray-700', oculto: 'bg-red-100 text-red-800',
};

export default function MisSolicitudes() {
  const { datos, error, cargando, recargar } = useDatos('/solicitudes/enviadas');
  return (
    <div className="contenedor max-w-4xl py-10">
      <h1 className="titulo-seccion">Mis pedidos y solicitudes</h1>
      <p className="mb-5 text-suave">Aquí ve los productos por los que ha contactado a los productores y si ya los atendieron.</p>
      {cargando && <Cargando />}
      <MensajeError error={error} reintentar={recargar} />
      {datos && (datos.solicitudes.length === 0
        ? <><Vacio>Todavía no ha contactado a ningún productor.</Vacio><Link to="/catalogo" className="btn mt-4">Ir al catálogo</Link></>
        : (
          <div className="overflow-x-auto">
            <table className="tabla">
              <thead><tr><th>Fecha</th><th>Producto</th><th>Finca</th><th>Cantidad</th><th>Estado</th></tr></thead>
              <tbody>
                {datos.solicitudes.map((s) => (
                  <tr key={s.id_solicitud}>
                    <td className="whitespace-nowrap">{fecha(s.fecha_solicitud)}</td>
                    <td><Link to={`/producto/${s.id_producto}`} className="font-semibold text-verde-osc hover:underline">{s.producto}</Link>{s.mensaje && <><br /><span className="text-sm text-suave">{s.mensaje}</span></>}</td>
                    <td>{s.nombre_finca}</td>
                    <td>{s.cantidad ? `${Number(s.cantidad)} ${s.unidad}` : '—'}</td>
                    <td><span className={`chip ${colorEstado[s.estado]}`}>{s.estado}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
    </div>
  );
}
