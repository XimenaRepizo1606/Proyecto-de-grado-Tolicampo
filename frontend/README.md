# ToliCampo – Frontend (React + Tailwind CSS)

Aplicación web progresiva (PWA) de ToliCampo. Consume la API REST del proyecto (`../backend`) y conserva el diseño
del prototipo navegable en HTML (colores, tipografía Barlow e imágenes).

## Pantallas

| Rol | Pantalla | Ruta | Requisito |
|---|---|---|---|
| Todos | Inicio con ofertas, categorías y precios de referencia | `/` | RF06, RF10 |
| Todos | Catálogo con buscador y filtros (categoría, municipio, precio) | `/catalogo` | RF06 |
| Todos | Detalle del producto, finca, verificación y precio SIPSA | `/producto/:id` | RF07, RF10 |
| Todos | Precios de referencia | `/precios` | RF10 |
| Todos | Registro de comprador o productor con autorización de datos | `/registro` | RF01 |
| Todos | Ingreso con correo o celular | `/ingresar` | RF02 |
| Comprador | Carrito por kilo o libra y envío del pedido por WhatsApp | `/carrito` | RF08 |
| Comprador | Mis pedidos y solicitudes | `/mis-solicitudes` | RF08 |
| Productor | Mis productos: editar, pausar, agotado, activar | `/productor` | RF05 |
| Productor | Publicar o editar producto con foto | `/productor/nuevo` | RF04, RF05 |
| Productor | Solicitudes recibidas | `/productor/solicitudes` | RF09 |
| Productor | Perfil de la finca | `/productor/perfil` | RF03 |
| Administrador | Reportes | `/admin` | RF13 |
| Administrador | Verificar productores | `/admin/productores` | RF11 |
| Administrador | Moderar publicaciones | `/admin/publicaciones` | RF11 |
| Administrador | Cargar precios SIPSA desde CSV | `/admin/precios` | RF12 |

## Ejecutar en el computador

```bash
cd frontend
npm install
cp .env.example .env      # en Windows: copy .env.example .env
npm run dev               # abre http://localhost:5173
```

En `.env` va la dirección de la API (`VITE_API_URL`). Para usar la API publicada desde `localhost:5173`, en Railway
la variable `CORS_ORIGIN` debe incluir `http://localhost:5173` (separada por coma de la dirección de Vercel).

## Publicar en Vercel

1. Importar el repositorio en Vercel.
2. **Root Directory**: `frontend` · **Framework**: Vite · **Build**: `npm run build` · **Output**: `dist`.
3. **Environment Variables**: `VITE_API_URL` = `https://proyecto-de-grado-tolicampo-production.up.railway.app/api`.
4. Deploy. El archivo `vercel.json` hace que las rutas (`/catalogo`, `/productor`…) funcionen al recargar la página.

## Decisiones técnicas

- **React 18 + React Router 6 + Tailwind CSS 3**, empaquetado con Vite.
- **PWA**: `manifest.webmanifest` y `sw.js` permiten instalarla en el celular y abrirla rápido con mala señal.
  Las respuestas de la API no se guardan en caché, para no mostrar precios desactualizados.
- **Fotos**: antes de subirlas se reducen en el navegador a máximo 1280 px (las fotos de celular suelen pesar más de 2 MB,
  que es el límite de la API) y así el catálogo carga rápido con datos móviles. Si un producto no tiene foto se muestra
  la imagen de su categoría.
- **Sesión**: el token JWT se guarda en el navegador y se envía en cada petición. Si vence, la aplicación pide ingresar de nuevo.
