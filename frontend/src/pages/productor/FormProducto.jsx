import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api.js';
import { Cargando, MensajeError } from '../../components/Estado.jsx';
import { useCatalogo, useDatos } from '../../hooks.js';
import { useSesion } from '../../sesion.jsx';
import { fotoProducto, pesos, UNIDADES } from '../../util.js';

// Reduce la foto del celular (suelen pesar 3–6 MB) a máximo 1280 px en JPEG, para cumplir el límite de 2 MB
// y para que el catálogo cargue rápido con datos móviles.
async function reducirFoto(archivo) {
  if (!/^image\/(jpeg|png|webp)$/.test(archivo.type)) throw new Error('La foto debe ser JPG, PNG o WEBP.');
  if (archivo.size < 400 * 1024) return archivo;
  const img = await new Promise((ok, falla) => {
    const i = new Image(); i.onload = () => ok(i); i.onerror = () => falla(new Error('No se pudo leer la foto.'));
    i.src = URL.createObjectURL(archivo);
  });
  const escala = Math.min(1, 1280 / Math.max(img.width, img.height));
  const lienzo = document.createElement('canvas');
  lienzo.width = Math.round(img.width * escala); lienzo.height = Math.round(img.height * escala);
  lienzo.getContext('2d').drawImage(img, 0, 0, lienzo.width, lienzo.height);
  URL.revokeObjectURL(img.src);
  const blob = await new Promise((ok) => lienzo.toBlob(ok, 'image/jpeg', 0.8));
  return new File([blob], archivo.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
}

const VACIO = { nombre: '', id_categoria: '', precio_unitario: '', unidad: 'kilo', descuento_pct: '0', cantidad_disponible: '' };

export default function FormProducto() {
  const { id } = useParams();
  const editando = !!id;
  const navegar = useNavigate();
  const { avisar } = useSesion();
  const categorias = useCatalogo('categorias');
  const mios = useDatos(editando ? '/productos/mios' : null);
  const precios = useDatos('/precios');
  const [f, setF] = useState(VACIO);
  const [original, setOriginal] = useState(null);
  const [foto, setFoto] = useState(null);
  const [vista, setVista] = useState(null);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!editando || !mios.datos) return;
    const p = mios.datos.productos.find((x) => String(x.id_producto) === id);
    if (!p) { setError(new Error('No encontramos ese producto entre sus publicaciones.')); return; }
    setOriginal(p);
    setF({ nombre: p.nombre, id_categoria: String(p.id_categoria), precio_unitario: String(p.precio_unitario), unidad: p.unidad,
      descuento_pct: String(Number(p.descuento_pct)), cantidad_disponible: String(Number(p.cantidad_disponible)) });
  }, [editando, mios.datos, id]);

  const referencia = useMemo(() => precios.datos?.precios.find((r) => r.nombre_producto.toLowerCase() === f.nombre.trim().toLowerCase()), [precios.datos, f.nombre]);
  const final = Math.round(Number(f.precio_unitario || 0) * (1 - Number(f.descuento_pct || 0) / 100));
  const cambiar = (c) => (e) => setF({ ...f, [c]: e.target.value });

  async function elegirFoto(e) {
    const a = e.target.files?.[0];
    if (!a) return;
    try {
      const reducida = await reducirFoto(a);
      setFoto(reducida); setVista(URL.createObjectURL(reducida)); setError(null);
    } catch (err) { setError(err); e.target.value = ''; }
  }

  async function enviar(e) {
    e.preventDefault();
    setError(null); setEnviando(true);
    const datos = new FormData();
    Object.entries(f).forEach(([k, v]) => datos.append(k, v));
    if (foto) datos.append('foto', foto);
    try {
      const r = await api(editando ? `/productos/${id}` : '/productos', { metodo: editando ? 'PUT' : 'POST', cuerpo: datos });
      avisar(editando ? 'Producto actualizado' : `¡${r.producto.nombre} quedó publicado!`);
      navegar('/productor');
    } catch (err) { setError(err); } finally { setEnviando(false); }
  }

  if (editando && mios.cargando) return <div className="contenedor"><Cargando /></div>;

  return (
    <div className="contenedor max-w-2xl py-10">
      <Link to="/productor" className="text-sm font-semibold text-naranja-osc underline">← Volver a mi panel</Link>
      <h1 className="titulo-seccion mt-3">{editando ? 'Editar producto' : 'Publica tu producto'}</h1>
      <form onSubmit={enviar} className="grid gap-4">
        <fieldset className="grid gap-3 border-2 border-verde-fondo p-4">
          <legend className="px-2 font-titulo text-xl font-bold text-verde-osc">1. ¿Qué vas a vender?</legend>
          <label className="campo">Nombre del producto<input value={f.nombre} onChange={cambiar('nombre')} required minLength="2" maxLength="100" placeholder="Ej.: Plátano hartón" list="nombres-sipsa" /></label>
          <datalist id="nombres-sipsa">{precios.datos?.precios.map((r) => <option key={r.nombre_producto} value={r.nombre_producto} />)}</datalist>
          <label className="campo">Categoría
            <select value={f.id_categoria} onChange={cambiar('id_categoria')} required>
              <option value="">Seleccione…</option>
              {categorias.map((c) => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
            </select>
          </label>
          <label className="campo">Foto del producto {editando && '(opcional, reemplaza la actual)'}
            <input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={elegirFoto} />
          </label>
          {(vista || original) && <img src={vista || fotoProducto(original)} alt="Vista previa de la foto" className="h-44 w-full border-2 border-verde-fondo object-cover" />}
        </fieldset>

        <fieldset className="grid gap-3 border-2 border-verde-fondo p-4">
          <legend className="px-2 font-titulo text-xl font-bold text-verde-osc">2. Precio y cantidad</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="campo">Precio (COP)<input type="number" inputMode="numeric" min="1" step="1" value={f.precio_unitario} onChange={cambiar('precio_unitario')} required /></label>
            <label className="campo">Se vende por
              <select value={f.unidad} onChange={cambiar('unidad')}>{UNIDADES.map((u) => <option key={u}>{u}</option>)}</select>
            </label>
            <label className="campo">Cantidad disponible ({f.unidad}s)<input type="number" inputMode="decimal" min="0" step="0.5" value={f.cantidad_disponible} onChange={cambiar('cantidad_disponible')} required /></label>
            <label className="campo">Descuento (%)<input type="number" inputMode="numeric" min="0" max="90" value={f.descuento_pct} onChange={cambiar('descuento_pct')} /></label>
          </div>
          {f.precio_unitario && (
            <p className="font-semibold text-verde-med">
              Los compradores verán {pesos(final)} por {f.unidad}{f.unidad === 'kilo' && ` y ${pesos(final / 2)} por libra`}.
            </p>
          )}
          {referencia && f.unidad === 'kilo' && (
            <p className="bg-verde-fondo/60 p-2 text-sm">Precio mayorista de referencia (SIPSA): <strong>{pesos(referencia.valor_kg)} / kg</strong>. Úselo como guía para fijar su precio.</p>
          )}
        </fieldset>

        <MensajeError error={error} />
        <div className="flex flex-wrap gap-3">
          <button className="btn flex-1" disabled={enviando}>{enviando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Publicar producto'}</button>
          <Link to="/productor" className="btn btn-claro">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}
