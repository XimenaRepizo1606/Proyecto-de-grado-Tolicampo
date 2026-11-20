import { Link } from 'react-router-dom';

export default function Pie() {
  return (
    <footer className="mt-auto border-t-[5px] border-naranja bg-verde-osc pt-10 text-[#e3f2d4]">
      <div className="contenedor grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <h3 className="mb-1 flex items-center gap-2 text-2xl text-verde-cla"><img src="/imagenes/logo-tolicampo.svg" alt="" className="h-9 w-9" />ToliCampo</h3>
          <p>Plataforma para la comercialización directa entre pequeños productores de Ibagué y el Tolima y compradores locales.</p>
        </div>
        <div>
          <h3 className="mb-1 text-2xl text-verde-cla">Explora</h3>
          <ul className="space-y-1">
            <li><Link to="/catalogo" className="hover:underline">Catálogo de productos</Link></li>
            <li><Link to="/precios" className="hover:underline">Precios de referencia (SIPSA)</Link></li>
            <li><Link to="/registro" className="hover:underline">Registrar mi finca</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-1 text-2xl text-verde-cla">Cómo funciona</h3>
          <p>El pago y la entrega se acuerdan directamente con el productor por WhatsApp. ToliCampo no cobra comisión.</p>
        </div>
      </div>
      <p className="mt-8 bg-black/25 p-4 text-center text-sm">© 2026 ToliCampo – Prototipo académico, Ingeniería de Sistemas, UNAD. Los datos de fincas y productos son de prueba.</p>
    </footer>
  );
}
