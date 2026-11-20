import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cargando, MensajeError } from '../components/Estado.jsx';
import TarjetaProducto from '../components/TarjetaProducto.jsx';
import { useCatalogo, useDatos } from '../hooks.js';
import { useSesion } from '../sesion.jsx';
import { DESCRIPCION_CATEGORIA, fecha, imagenCategoria, pesos } from '../util.js';

const DESTACADOS = [
  { titulo: 'Verduras y hortalizas', texto: 'Colores y sabores de la huerta tolimense', img: '/imagenes/tomate.jpg', cat: 'Verduras' },
  { titulo: 'Fresas de Ibagué', texto: 'Dulces, rojas y recién cosechadas', img: '/imagenes/fresas.jpg', cat: 'Frutas' },
  { titulo: 'Granos del sur del Tolima', texto: 'Fríjol y lenteja de las fincas de montaña', img: '/imagenes/legumbres.jpg', cat: 'Granos' },
  { titulo: 'Pulpas 100 % fruta', texto: 'Jugos naturales listos en segundos', img: '/imagenes/pulpas_de_frutas.jpg', cat: 'Pulpas de fruta' },
];

function Carrusel({ categorias }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const t = setInterval(() => setI((x) => (x + 1) % DESTACADOS.length), 6000);
    return () => clearInterval(t);
  }, []);
  const idCat = (nombre) => categorias.find((c) => c.nombre === nombre)?.id_categoria;
  return (
    <div className="relative h-[300px] overflow-hidden bg-verde-osc md:h-[420px]" aria-roledescription="carrusel">
      <div className="flex h-full transition-transform duration-700" style={{ transform: `translateX(-${i * 100}%)` }}>
        {DESTACADOS.map((d, k) => (
          <div key={d.titulo} className="relative h-full min-w-full bg-cover bg-center" style={{ backgroundImage: `url(${d.img})` }}
            aria-hidden={k !== i}>
            <div className="absolute inset-0 bg-gradient-to-t from-verde-osc/90 via-verde-osc/30 to-transparent" />
            <div className="absolute bottom-6 left-6 z-10 max-w-md text-white md:left-8">
              <h3 className="text-3xl">{d.titulo}</h3>
              <p>{d.texto}</p>
              <Link to={idCat(d.cat) ? `/catalogo?categoria=${idCat(d.cat)}` : '/catalogo'} tabIndex={k === i ? 0 : -1}
                className="mt-2 inline-block bg-naranja px-4 py-1.5 font-bold text-white">Ver productos</Link>
            </div>
          </div>
        ))}
      </div>
      <button aria-label="Anterior" onClick={() => setI((i - 1 + DESTACADOS.length) % DESTACADOS.length)}
        className="absolute left-3 top-1/2 z-10 h-11 w-11 -translate-y-1/2 bg-white text-2xl text-verde-osc">‹</button>
      <button aria-label="Siguiente" onClick={() => setI((i + 1) % DESTACADOS.length)}
        className="absolute right-3 top-1/2 z-10 h-11 w-11 -translate-y-1/2 bg-white text-2xl text-verde-osc">›</button>
      <div className="absolute bottom-4 right-5 z-10 flex gap-1.5">
        {DESTACADOS.map((d, k) => (
          <button key={d.titulo} aria-label={`Ir a ${d.titulo}`} onClick={() => setI(k)}
            className={`h-1.5 w-7 ${k === i ? 'bg-naranja' : 'bg-white/50'}`} />
        ))}
      </div>
    </div>
  );
}

export default function Inicio() {
  const { usuario } = useSesion();
  const categorias = useCatalogo('categorias');
  const ofertas = useDatos('/productos/ofertas');
  const precios = useDatos('/precios');

  return (
    <>
      <section className="overflow-hidden bg-verde-fondo">
        <div className="contenedor grid items-end gap-6 pt-10 md:grid-cols-[1.2fr_1fr] md:gap-12 md:pt-14">
          <div className="md:pb-16">
            <h1 className="max-w-[12ch] text-5xl leading-none text-verde-osc md:text-7xl">Cosechado hoy en el Tolima. En tu mesa mañana.</h1>
            <p className="my-5 max-w-[50ch] text-xl">Frutas, verduras, granos y más de fincas de Ibagué y otros municipios del Tolima, sin intermediarios. Compras directo al productor y acuerdas la entrega por WhatsApp.</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/catalogo" className="btn">Comprar ahora</Link>
              {usuario?.rol === 'productor'
                ? <Link to="/productor/nuevo" className="btn btn-claro">Publicar un producto</Link>
                : <Link to="/registro?rol=productor" className="btn btn-claro">Soy productor</Link>}
            </div>
          </div>
          <div className="relative">
            <img src="/imagenes/banner.jpg" alt="Puesto de verduras frescas del Tolima" width="900" height="600"
              className="h-[320px] w-full rounded-t-full border-[6px] border-b-0 border-verde-osc object-cover md:h-[500px]" />
            <span className="absolute bottom-14 left-2 grid h-28 w-28 -rotate-12 place-items-center rounded-full bg-naranja text-center font-titulo text-xl font-bold leading-tight text-white shadow-lg md:-left-8">Directo<br />del campo</span>
          </div>
        </div>
      </section>

      <section className="contenedor py-14">
        <h2 className="titulo-seccion">Lo mejor de nuestras fincas</h2>
        <Carrusel categorias={categorias} />
      </section>

      <section className="contenedor pb-14">
        <h2 className="titulo-seccion">Explora los catálogos</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categorias.map((c) => (
            <Link key={c.id_categoria} to={`/catalogo?categoria=${c.id_categoria}`} className="tarjeta">
              <img src={imagenCategoria(c.nombre)} alt="" loading="lazy" className="h-28 w-full object-cover md:h-36" />
              <div className="p-3 text-center">
                <h3 className="text-xl text-verde-osc">{c.nombre}</h3>
                <p className="hidden text-sm text-suave md:block">{DESCRIPCION_CATEGORIA[c.nombre]}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-verde-osc">
        <div className="contenedor py-14">
          <h2 className="titulo-seccion text-white">Ofertas de la semana</h2>
          {ofertas.cargando && <Cargando />}
          <MensajeError error={ofertas.error} reintentar={ofertas.recargar} />
          {ofertas.datos && (ofertas.datos.productos.length
            ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{ofertas.datos.productos.map((p) => <TarjetaProducto key={p.id_producto} p={p} />)}</div>
            : <p className="text-white">Esta semana no hay productos con descuento.</p>)}
        </div>
      </section>

      <section className="contenedor py-14">
        <h2 className="titulo-seccion">Precios de referencia</h2>
        <p className="mb-4 max-w-[70ch] text-suave">Compara el precio del productor con el precio mayorista de referencia antes de negociar. Precios tomados del Sistema de Información de Precios del Sector Agropecuario (SIPSA) del DANE.</p>
        <MensajeError error={precios.error} />
        {precios.datos && (
          <div className="overflow-x-auto">
            <table className="tabla">
              <thead><tr><th>Producto</th><th>Precio en ToliCampo (kg)</th><th>Precio mayorista (kg)</th><th>Fecha del dato</th></tr></thead>
              <tbody>
                {precios.datos.precios.slice(0, 5).map((p) => (
                  <tr key={p.nombre_producto}>
                    <td>{p.nombre_producto}</td>
                    <td className="font-bold text-naranja-osc">{pesos(p.precio_tolicampo_kg)}</td>
                    <td>{pesos(p.valor_kg)}</td>
                    <td>{fecha(p.fecha_dato)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Link to="/precios" className="btn btn-claro btn-peq mt-4">Ver todos los precios</Link>
      </section>

      <section className="bg-naranja text-white">
        <div className="contenedor grid gap-6 py-12 md:grid-cols-3">
          {[['1', 'Elige', 'Busca por categoría o municipio y compara con el precio de referencia.'],
            ['2', 'Escribe al productor', 'Tu pedido llega por WhatsApp a cada finca, con productos y total.'],
            ['3', 'Acuerda pago y entrega', 'Lo coordinas directo con el productor. ToliCampo no cobra comisión.']].map(([n, t, d]) => (
            <div key={n} className="flex gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white font-titulo text-2xl font-bold text-naranja-osc">{n}</span>
              <div><h3 className="text-2xl">{t}</h3><p>{d}</p></div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
