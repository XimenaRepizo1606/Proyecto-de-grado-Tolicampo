import { Link } from 'react-router-dom';

export default function NoEncontrada() {
  return (
    <div className="contenedor py-20 text-center">
      <h1 className="text-5xl text-verde-osc">Página no encontrada</h1>
      <p className="my-4 text-suave">La dirección no existe o cambió.</p>
      <Link to="/" className="btn">Volver al inicio</Link>
    </div>
  );
}
