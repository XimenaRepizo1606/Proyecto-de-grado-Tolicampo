import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useCatalogo } from '../hooks.js';
import { useSesion } from '../sesion.jsx';

const enlace = ({ isActive }) =>
  `block px-3.5 py-1.5 font-titulo text-xl font-bold transition-colors ${isActive ? 'bg-naranja text-white' : 'text-naranja hover:bg-naranja hover:text-white'}`;

export default function Encabezado() {
  const { usuario, salir, enCarrito } = useSesion();
  const categorias = useCatalogo('categorias');
  const [menu, setMenu] = useState(false);
  const [cats, setCats] = useState(false);
  const [buscar, setBuscar] = useState(false);
  const [q, setQ] = useState('');
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const refCats = useRef(null);

  useEffect(() => { setMenu(false); setCats(false); }, [ubicacion.pathname, ubicacion.search]);
  useEffect(() => {
    const fuera = (e) => { if (refCats.current && !refCats.current.contains(e.target)) setCats(false); };
    document.addEventListener('click', fuera);
    return () => document.removeEventListener('click', fuera);
  }, []);

  function enviarBusqueda(e) {
    e.preventDefault();
    navegar(`/catalogo?q=${encodeURIComponent(q.trim())}`);
    setBuscar(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b-[3px] border-naranja bg-white">
      <div className="contenedor flex flex-wrap items-center gap-2 py-2 md:gap-3">
        <Link to="/" className="flex items-center gap-1.5 font-titulo text-[1.7rem] font-bold text-verde-osc md:text-3xl">
          <img src="/imagenes/logo-tolicampo.svg" alt="" className="h-10 w-10 md:h-11 md:w-11" />ToliCampo
        </Link>

        <nav aria-label="Principal"
          className={`${menu ? 'flex' : 'hidden'} absolute left-0 right-0 top-full flex-col border-b-[3px] border-naranja bg-white px-[4%] py-2 lg:static lg:ml-auto lg:flex lg:flex-row lg:border-0 lg:p-0`}>
          <NavLink to="/" end className={enlace}>Inicio</NavLink>
          <div className="relative" ref={refCats}>
            <button className={`${enlace({ isActive: cats })} w-full text-left`} aria-expanded={cats} aria-haspopup="true"
              onClick={() => setCats(!cats)}>Categorías ▾</button>
            {cats && (
              <div className="min-w-[250px] border-t-[3px] border-naranja bg-white p-1 lg:absolute lg:left-0 lg:top-full lg:shadow-xl">
                <Link to="/catalogo" className="block px-3 py-1.5 font-semibold text-verde-osc hover:bg-verde-fondo">Todos los productos</Link>
                {categorias.map((c) => (
                  <Link key={c.id_categoria} to={`/catalogo?categoria=${c.id_categoria}`}
                    className="block px-3 py-1.5 text-verde-osc hover:bg-verde-fondo">{c.nombre}</Link>
                ))}
              </div>
            )}
          </div>
          <NavLink to="/precios" className={enlace}>Precios</NavLink>
          {usuario?.rol === 'comprador' && <NavLink to="/mis-solicitudes" className={enlace}>Mis pedidos</NavLink>}
          {usuario?.rol === 'productor' && <NavLink to="/productor" className={enlace}>Mi panel</NavLink>}
          {usuario?.rol === 'admin' && <NavLink to="/admin" className={enlace}>Administración</NavLink>}
          {!usuario && <NavLink to="/ingresar" className={(a) => `${enlace(a)} sm:hidden`}>Ingresar</NavLink>}
          {!usuario && <NavLink to="/registro" className={(a) => `${enlace(a)} sm:hidden`}>Registrarse</NavLink>}
          {usuario?.rol === 'productor' && <NavLink to="/productor/nuevo" className={(a) => `${enlace(a)} sm:hidden`}>Publicar producto</NavLink>}
          {usuario && (
            <button onClick={() => { navegar('/'); salir(); }} className="px-3.5 py-1.5 text-left font-titulo text-xl font-bold text-suave hover:text-naranja-osc lg:hidden">
              Salir ({usuario.nombre.split(' ')[0]})
            </button>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <button onClick={() => setBuscar(!buscar)} aria-label="Buscar productos" aria-expanded={buscar}
            className="grid h-10 w-10 place-items-center rounded-full border-2 border-naranja bg-orange-50 text-xl transition-transform hover:scale-105 md:h-11 md:w-11">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-naranja-osc" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          </button>
          {usuario?.rol === 'productor' && <Link to="/productor/nuevo" className="btn btn-claro btn-peq hidden sm:inline-flex">Publicar producto</Link>}
          {!usuario && (
            <>
              <Link to="/ingresar" className="btn btn-claro btn-peq hidden sm:inline-flex">Ingresar</Link>
              <Link to="/registro" className="btn btn-peq hidden sm:inline-flex">Registrarse</Link>
            </>
          )}
          {usuario && (
            <button onClick={() => { navegar('/'); salir(); }} className="hidden text-sm font-semibold text-suave hover:text-naranja-osc lg:block"
              title={`Sesión de ${usuario.nombre}`}>Salir</button>
          )}
          {(!usuario || usuario.rol === 'comprador') && (
            <Link to="/carrito" aria-label={`Ver carrito, ${enCarrito} productos`} className="relative grid h-10 w-10 place-items-center rounded-full bg-naranja md:h-11 md:w-11">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /><path d="M2 3h3l2.6 12.2a1.5 1.5 0 0 0 1.5 1.2h8.8a1.5 1.5 0 0 0 1.5-1.1L21 8H6" /></svg>
              <span className="absolute -right-1.5 -top-1.5 grid h-[22px] min-w-[22px] place-items-center rounded-full border-2 border-white bg-verde-osc px-1 text-xs font-bold text-white">{enCarrito}</span>
            </Link>
          )}
          <button className="px-1 text-3xl text-naranja lg:hidden" aria-label="Abrir menú" aria-expanded={menu} onClick={() => setMenu(!menu)}>☰</button>
        </div>
      </div>
      {buscar && (
        <form onSubmit={enviarBusqueda} role="search" className="flex justify-center gap-2 bg-verde-fondo px-[4%] py-3">
          <input type="search" autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Busca tomate, café, fresa, Planadas…"
            aria-label="Buscar productos" className="w-full max-w-xl rounded-full border-2 border-verde-osc bg-white px-4 py-2" />
          <button className="btn" type="submit">Buscar</button>
        </form>
      )}
    </header>
  );
}
