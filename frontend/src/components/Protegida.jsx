import { Navigate, useLocation } from 'react-router-dom';
import { useSesion } from '../sesion.jsx';
import { Cargando } from './Estado.jsx';

// Muestra la página solo a los roles indicados; si no hay sesión, envía a ingresar
export default function Protegida({ roles, children }) {
  const { usuario, cargando } = useSesion();
  const ubicacion = useLocation();
  if (cargando) return <div className="contenedor"><Cargando /></div>;
  if (!usuario) return <Navigate to="/ingresar" replace state={{ desde: ubicacion.pathname + ubicacion.search }} />;
  if (roles && !roles.includes(usuario.rol)) {
    return (
      <div className="contenedor py-16">
        <h1 className="text-3xl text-verde-osc">Esta sección no está disponible para su cuenta</h1>
        <p className="mt-2 text-suave">Ingresó como <strong>{usuario.rol}</strong>.</p>
      </div>
    );
  }
  return children;
}
