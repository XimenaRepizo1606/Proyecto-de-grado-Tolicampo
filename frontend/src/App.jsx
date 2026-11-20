import { Route, Routes } from 'react-router-dom';
import Aviso from './components/Aviso.jsx';
import Encabezado from './components/Encabezado.jsx';
import Pie from './components/Pie.jsx';
import Protegida from './components/Protegida.jsx';
import Carrito from './pages/Carrito.jsx';
import Catalogo from './pages/Catalogo.jsx';
import Detalle from './pages/Detalle.jsx';
import Ingresar from './pages/Ingresar.jsx';
import Inicio from './pages/Inicio.jsx';
import MisSolicitudes from './pages/MisSolicitudes.jsx';
import NoEncontrada from './pages/NoEncontrada.jsx';
import Precios from './pages/Precios.jsx';
import Registro from './pages/Registro.jsx';
import PanelAdmin from './pages/admin/PanelAdmin.jsx';
import FormProducto from './pages/productor/FormProducto.jsx';
import PanelProductor from './pages/productor/PanelProductor.jsx';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:z-[200] focus:bg-white focus:p-2">Saltar al contenido</a>
      <Encabezado />
      <main id="contenido" className="flex-1">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/producto/:id" element={<Detalle />} />
          <Route path="/precios" element={<Precios />} />
          <Route path="/ingresar" element={<Ingresar />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/carrito" element={<Protegida roles={['comprador']}><Carrito /></Protegida>} />
          <Route path="/mis-solicitudes" element={<Protegida roles={['comprador']}><MisSolicitudes /></Protegida>} />
          <Route path="/productor/nuevo" element={<Protegida roles={['productor']}><FormProducto /></Protegida>} />
          <Route path="/productor/editar/:id" element={<Protegida roles={['productor']}><FormProducto /></Protegida>} />
          <Route path="/productor/*" element={<Protegida roles={['productor']}><PanelProductor /></Protegida>} />
          <Route path="/admin/*" element={<Protegida roles={['admin']}><PanelAdmin /></Protegida>} />
          <Route path="*" element={<NoEncontrada />} />
        </Routes>
      </main>
      <Pie />
      <Aviso />
    </div>
  );
}
