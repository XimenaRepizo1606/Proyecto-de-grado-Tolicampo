import { Cargando, MensajeError, Vacio } from '../components/Estado.jsx';
import { useDatos } from '../hooks.js';
import { fecha, pesos } from '../util.js';

export default function Precios() {
  const { datos, error, cargando, recargar } = useDatos('/precios');
  return (
    <div className="contenedor py-10">
      <h1 className="titulo-seccion">Precios de referencia</h1>
      <p className="mb-5 max-w-[75ch] text-suave">
        Precio mayorista por kilo publicado por el Sistema de Información de Precios del Sector Agropecuario (SIPSA) del DANE, junto al menor precio
        del mismo producto en ToliCampo. Sirve para que productores y compradores negocien con información.
      </p>
      {cargando && <Cargando />}
      <MensajeError error={error} reintentar={recargar} />
      {datos && (datos.precios.length === 0 ? <Vacio>Aún no hay precios cargados.</Vacio> : (
        <div className="overflow-x-auto">
          <table className="tabla">
            <thead><tr><th>Producto</th><th>Categoría</th><th>Precio en ToliCampo (kg)</th><th>Precio mayorista (kg)</th><th>Diferencia</th><th>Fuente y fecha</th></tr></thead>
            <tbody>
              {datos.precios.map((p) => {
                const dif = p.precio_tolicampo_kg ? (p.precio_tolicampo_kg - p.valor_kg) / p.valor_kg * 100 : null;
                return (
                  <tr key={p.nombre_producto}>
                    <td className="font-semibold">{p.nombre_producto}</td>
                    <td>{p.categoria}</td>
                    <td className="font-bold text-naranja-osc">{p.precio_tolicampo_kg ? pesos(p.precio_tolicampo_kg) : 'Sin publicar'}</td>
                    <td>{pesos(p.valor_kg)}</td>
                    <td>{dif === null ? '—' : `${dif > 0 ? '+' : ''}${dif.toFixed(0)} %`}</td>
                    <td className="text-sm text-suave">{p.fuente || 'SIPSA'} · {fecha(p.fecha_dato)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
