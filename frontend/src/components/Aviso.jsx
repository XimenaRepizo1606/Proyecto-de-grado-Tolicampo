import { useSesion } from '../sesion.jsx';

export default function Aviso() {
  const { aviso } = useSesion();
  return (
    <div role="status" aria-live="polite"
      className={`fixed bottom-5 left-1/2 z-[120] max-w-[92vw] -translate-x-1/2 border-2 px-5 py-3 font-semibold text-white shadow-lg transition-all duration-300
        ${aviso ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-24 opacity-0'}
        ${aviso?.tipo === 'error' ? 'border-white bg-naranja-osc' : 'border-naranja bg-verde-osc'}`}>
      {aviso?.texto}
    </div>
  );
}
