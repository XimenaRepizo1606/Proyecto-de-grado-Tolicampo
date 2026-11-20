export function Cargando({ texto = 'Cargando…' }) {
  return (
    <div className="flex items-center gap-3 py-10 text-suave" role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-[3px] border-verde-fondo border-t-naranja" />
      {texto}
    </div>
  );
}

export function MensajeError({ error, reintentar }) {
  if (!error) return null;
  return (
    <div className="my-4 border-l-4 border-naranja-osc bg-orange-50 p-4 text-naranja-osc" role="alert">
      <p className="font-semibold">{error.message || String(error)}</p>
      {error.detalles && (
        <ul className="mt-2 list-disc pl-5 text-sm">
          {error.detalles.map((d, i) => <li key={i}>{d.linea ? `Línea ${d.linea}: ` : ''}{d.error || d.mensaje || JSON.stringify(d)}</li>)}
        </ul>
      )}
      {reintentar && <button className="btn btn-claro btn-peq mt-3" onClick={reintentar}>Intentar de nuevo</button>}
    </div>
  );
}

export function Vacio({ children }) {
  return <p className="border-2 border-dashed border-verde-fondo p-6 text-center text-suave">{children}</p>;
}
