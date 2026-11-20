import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Cargando, MensajeError, Vacio } from '../components/Estado.jsx';
import TarjetaProducto from '../components/TarjetaProducto.jsx';
import { useCatalogo, useDatos } from '../hooks.js';
import { DESCRIPCION_CATEGORIA } from '../util.js';

const CAMPOS = ['categoria', 'q', 'municipio', 'min', 'max'];

export default function Catalogo() {
  const [params, setParams] = useSearchParams();
  const categorias = useCatalogo('categorias');
  const veredas = useCatalogo('veredas');
  const municipios = useMemo(() => [...new Set(veredas.map((v) => v.municipio))].sort(), [veredas]);
  const [form, setForm] = useState({});
  const [abierto, setAbierto] = useState(false);

  useEffect(() => { setForm(Object.fromEntries(CAMPOS.map((c) => [c, params.get(c) || '']))); }, [params]);

  const consulta = new URLSearchParams(params);
  consulta.set('limite', '12');
  const { datos, error, cargando, recargar } = useDatos(`/productos?${consulta}`);
  const pagina = Number(params.get('pagina') || 1);
  const paginas = datos ? Math.max(1, Math.ceil(datos.total / datos.limite)) : 1;
  const cat = categorias.find((c) => String(c.id_categoria) === params.get('categoria'));

  function aplicar(e) {
    e.preventDefault();
    const nuevos = {};
    CAMPOS.forEach((c) => { if (String(form[c] || '').trim()) nuevos[c] = String(form[c]).trim(); });
    setParams(nuevos);
    setAbierto(false);
  }
  const irA = (p) => { const n = new URLSearchParams(params); n.set('pagina', p); setParams(n); window.scrollTo({ top: 0 }); };
  const cambiar = (c) => (e) => setForm({ ...form, [c]: e.target.value });

  return (
    <>
      <section className="border-b-[5px] border-naranja bg-verde-osc py-10 text-white">
        <div className="contenedor">
          <h1 className="text-5xl text-verde-cla">{cat ? cat.nombre : params.get('q') ? `Resultados para “${params.get('q')}”` : 'Catálogo de productos'}</h1>
          <p className="max-w-[60ch] text-lg">{cat ? DESCRIPCION_CATEGORIA[cat.nombre] : 'Productos publicados por pequeños productores del Tolima. Filtra por categoría, municipio o precio.'}</p>
        </div>
      </section>

      <div className="contenedor grid gap-8 py-10 lg:grid-cols-[260px_1fr]">
        <aside>
          <button className="btn btn-claro w-full lg:hidden" onClick={() => setAbierto(!abierto)} aria-expanded={abierto}>
            {abierto ? 'Ocultar filtros' : 'Filtrar productos'}
          </button>
          <form onSubmit={aplicar} className={`${abierto ? 'grid' : 'hidden'} mt-4 gap-3 border-2 border-verde-fondo p-4 lg:mt-0 lg:grid`} aria-label="Filtros del catálogo">
            <h2 className="text-2xl text-verde-osc">Filtros</h2>
            <label className="campo">Buscar<input type="search" value={form.q || ''} onChange={cambiar('q')} placeholder="Ej.: tomate, finca" /></label>
            <label className="campo">Categoría
              <select value={form.categoria || ''} onChange={cambiar('categoria')}>
                <option value="">Todas</option>
                {categorias.map((c) => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
              </select>
            </label>
            <label className="campo">Municipio
              <select value={form.municipio || ''} onChange={cambiar('municipio')}>
                <option value="">Todos</option>
                {municipios.map((m) => <option key={m}>{m}</option>)}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="campo">Precio mínimo<input type="number" min="0" step="1" inputMode="numeric" value={form.min || ''} onChange={cambiar('min')} /></label>
              <label className="campo">Precio máximo<input type="number" min="0" step="1" inputMode="numeric" value={form.max || ''} onChange={cambiar('max')} /></label>
            </div>
            <button className="btn" type="submit">Aplicar filtros</button>
            {[...params.keys()].length > 0 && <button type="button" className="text-sm font-semibold text-naranja-osc underline" onClick={() => setParams({})}>Quitar filtros</button>}
          </form>
        </aside>

        <section aria-live="polite">
          {cargando && <Cargando texto="Buscando productos…" />}
          <MensajeError error={error} reintentar={recargar} />
          {datos && !cargando && (
            <>
              <p className="mb-4 text-suave">{datos.total} {datos.total === 1 ? 'producto encontrado' : 'productos encontrados'}</p>
              {datos.productos.length
                ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{datos.productos.map((p) => <TarjetaProducto key={p.id_producto} p={p} />)}</div>
                : <Vacio>No hay productos con esos filtros. Pruebe con otra categoría o quite el precio máximo.</Vacio>}
              {paginas > 1 && (
                <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Páginas">
                  <button className="btn btn-claro btn-peq" disabled={pagina <= 1} onClick={() => irA(pagina - 1)}>Anterior</button>
                  <span className="text-suave">Página {pagina} de {paginas}</span>
                  <button className="btn btn-claro btn-peq" disabled={pagina >= paginas} onClick={() => irA(pagina + 1)}>Siguiente</button>
                </nav>
              )}
            </>
          )}
        </section>
      </div>
    </>
  );
}
