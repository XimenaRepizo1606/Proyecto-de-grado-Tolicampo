# API REST de ToliCampo – Lista de rutas

Base local: `http://localhost:4000/api` · Base publicada: `https://<api-en-railway>/api`

Todas las respuestas son JSON. Los errores tienen la forma `{ "error": "mensaje" }`.
Las rutas marcadas con 🔒 necesitan la cabecera `Authorization: Bearer <token>`, que se recibe al registrarse o iniciar sesión.

**Estado:** ✅ implementada y probada

## Sprint 2 – Autenticación y perfil del productor (RF01, RF02, RF03)

| Estado | Método | Ruta | Quién | Para qué |
|---|---|---|---|---|
| ✅ | GET | `/salud` | Todos | Comprobar que la API está en línea |
| ✅ | GET | `/categorias` | Todos | Lista de las 7 categorías (selectores) |
| ✅ | GET | `/veredas` | Todos | Lista de veredas con municipio (registro del productor) |
| ✅ | POST | `/auth/registro` | Todos | Crear cuenta de productor o comprador (RF01) |
| ✅ | POST | `/auth/login` | Todos | Iniciar sesión con correo o celular (RF02) |
| ✅ | GET | `/auth/yo` 🔒 | Cualquier rol | Datos del usuario de la sesión |
| ✅ | GET | `/productores/mi-perfil` 🔒 | Productor | Ver su perfil y finca (RF03) |
| ✅ | PUT | `/productores/mi-perfil` 🔒 | Productor | Editar finca, vereda, cultivos o descripción (RF03) |
| ✅ | GET | `/productores/:id` | Todos | Perfil público del productor, sin datos de contacto |

### Ejemplos

**Registro de comprador** – `POST /auth/registro`
```json
{ "nombre": "Laura Gómez", "correo": "laura@correo.com", "contrasena": "Clave2026",
  "rol": "comprador", "acepta_tratamiento_datos": true }
```

**Registro de productor** (el celular es obligatorio porque se usa para WhatsApp)
```json
{ "nombre": "José Rojas", "telefono": "3101234567", "contrasena": "Clave2026",
  "rol": "productor", "acepta_tratamiento_datos": true,
  "nombre_finca": "El Mirador", "id_vereda": 1, "cultivos": "Café, plátano",
  "descripcion": "Café de montaña" }
```
Respuesta `201`: `{ "mensaje": "Registro exitoso", "token": "...", "usuario": { "id_usuario", "nombre", "correo", "telefono", "rol" } }`

Reglas: la contraseña debe tener mínimo 8 caracteres, con letras y números. El celular debe tener 10 dígitos y empezar por 3. Sin `acepta_tratamiento_datos: true` no se registra (Ley 1581). No se pueden crear administradores desde el registro.

**Inicio de sesión** – `POST /auth/login`
```json
{ "usuario": "productor1@ejemplo.test", "contrasena": "Prueba2026*" }
```
Respuesta `200`: `{ "token": "...", "usuario": { ... } }`. Si los datos son incorrectos: `401 { "error": "Usuario o contraseña incorrectos" }`. Hay un máximo de 10 intentos cada 15 minutos.

## Sprint 3 – Productos y catálogo (RF04 a RF07)

| Estado | Método | Ruta | Quién | Para qué |
|---|---|---|---|---|
| ✅ | GET | `/productos?categoria=&q=&min=&max=&municipio=&pagina=&limite=` | Todos | Catálogo con filtros y buscador (RF06) |
| ✅ | GET | `/productos/ofertas` | Todos | Ofertas de la semana |
| ✅ | GET | `/productos/:id` | Todos | Detalle con finca, municipio y verificado (RF07) |
| ✅ | GET | `/productos/mios` 🔒 | Productor | Sus publicaciones |
| ✅ | POST | `/productos` 🔒 | Productor | Publicar producto con foto (RF04) |
| ✅ | PUT | `/productos/:id` 🔒 | Productor dueño | Editar producto (RF05) |
| ✅ | PATCH | `/productos/:id/estado` 🔒 | Productor dueño | `{ "estado": "activo" \| "pausado" \| "agotado" }` (RF05) |

### Ejemplos del Sprint 3

**Catálogo** – `GET /productos?categoria=Frutas&q=fresa&max=8000`
- `categoria`: id (`4`) o nombre exacto (`Frutas`).
- `q`: busca en el nombre del producto, la finca y el municipio.
- `min` y `max`: rango del precio final, ya con descuento.
- `pagina` y `limite`: paginación (24 por página; máximo 100).

Respuesta: `{ "total": 13, "pagina": 1, "limite": 24, "productos": [ ... ] }`. Cada producto trae:
```json
{ "id_producto": 1, "nombre": "Tomate chonto", "categoria": "Verduras",
  "precio_unitario": 4800, "descuento_pct": 15, "precio_final": 4080, "precio_libra": 2040,
  "unidad": "kilo", "cantidad_disponible": 50, "foto_url": null, "estado": "activo",
  "id_productor": 1, "nombre_finca": "La Esperanza", "verificado": 1, "municipio": "Ibagué",
  "precio_referencia_kg": 3500, "fecha_referencia": "2026-10-16" }
```
Las fotos se muestran con la dirección de la API + `foto_url`, por ejemplo `https://<api>/uploads/abc.jpg`. Si `foto_url` es `null`, el frontend muestra una imagen por defecto.

**Publicar producto** – `POST /productos` 🔒 (productor). Se envía como **multipart/form-data** (`FormData` en React):
`nombre`, `id_categoria`, `precio_unitario`, `cantidad_disponible`, `unidad` (opcional: `kilo` por defecto), `descuento_pct` (opcional) y `foto` (opcional: JPG, PNG o WEBP de máximo 2 MB).
```js
const datos = new FormData();
datos.append('nombre', 'Mazorca'); datos.append('id_categoria', 3);
datos.append('precio_unitario', 3600); datos.append('cantidad_disponible', 40);
datos.append('foto', archivo);
fetch(`${API}/productos`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: datos });
```

**Editar** – `PUT /productos/:id` 🔒: se envían solo los campos que cambian (JSON o FormData si cambia la foto).

**Pausar, activar o marcar agotado** – `PATCH /productos/:id/estado` 🔒 con `{ "estado": "pausado" }`. Un producto pausado u oculto no aparece en el catálogo; el productor lo sigue viendo en `/productos/mios`.

## Sprint 4 – Contacto, carrito, precios y administración (RF08 a RF13)

| Estado | Método | Ruta | Quién | Para qué |
|---|---|---|---|---|
| ✅ | POST | `/solicitudes` 🔒 | Comprador | Crear solicitud; devuelve el enlace de WhatsApp (RF08) |
| ✅ | GET | `/solicitudes/recibidas` 🔒 | Productor | Solicitudes de sus productos (RF09) |
| ✅ | GET | `/solicitudes/enviadas` 🔒 | Comprador | Solicitudes que ha hecho |
| ✅ | PATCH | `/solicitudes/:id/estado` 🔒 | Productor | `pendiente`, `atendida` o `cerrada` (RF09) |
| ✅ | GET | `/carrito` 🔒 | Comprador | Carrito abierto con total |
| ✅ | POST | `/carrito/items` 🔒 | Comprador | `{ "id_producto", "cantidad", "unidad" }` |
| ✅ | PATCH | `/carrito/items/:id` 🔒 | Comprador | Cambiar cantidad |
| ✅ | DELETE | `/carrito/items/:id` 🔒 | Comprador | Quitar producto |
| ✅ | DELETE | `/carrito` 🔒 | Comprador | Vaciar el carrito |
| ✅ | POST | `/carrito/enviar` 🔒 | Comprador | Cierra el pedido y devuelve un enlace de WhatsApp por productor |
| ✅ | GET | `/precios` | Todos | Precios de referencia SIPSA (RF10) |
| ✅ | POST | `/precios/csv` 🔒 | Admin | Cargar precios desde un CSV (RF12) |
| ✅ | GET | `/admin/productores?verificado=0` 🔒 | Admin | Productores por verificar (RF11) |
| ✅ | PATCH | `/admin/productores/:id/verificar` 🔒 | Admin | Marcar como verificado (RF11) |
| ✅ | PATCH | `/admin/productos/:id/moderar` 🔒 | Admin | Ocultar o mostrar una publicación (RF11) |
| ✅ | GET | `/admin/reportes` 🔒 | Admin | Totales de usuarios, productos y solicitudes (RF13) |

### Ejemplos del Sprint 4

**Contactar al productor** – `POST /solicitudes` 🔒 (comprador)
```json
{ "id_producto": 1, "cantidad": 3, "mensaje": "¿Me lo envía el sábado?" }
```
Respuesta `201`: `{ "mensaje": "Solicitud enviada al productor", "id_solicitud": 4, "enlace_whatsapp": "https://wa.me/573000000001?text=..." }`. El frontend abre ese enlace con `window.open(enlace, '_blank')`.

**Carrito** – `POST /carrito/items` 🔒 con `{ "id_producto": 1, "cantidad": 2, "unidad": "libra" }`. Un producto que se vende por kilo también se puede pedir por libra, a la mitad del precio. Si se agrega el mismo producto con la misma unidad, la cantidad se suma.
Todas las rutas del carrito responden con el carrito completo:
```json
{ "id_pedido": 1, "total": 15480, "cantidad_items": 4,
  "items": [ { "id_detalle": 3, "id_producto": 1, "nombre": "Tomate chonto", "cantidad": 2, "unidad": "libra",
               "precio_unitario": 2040, "subtotal": 4080, "nombre_finca": "La Esperanza", "foto_url": null } ] }
```

**Enviar pedido** – `POST /carrito/enviar` 🔒. Cierra el pedido, crea una solicitud por producto para el productor y devuelve **un enlace de WhatsApp por cada productor**, porque cada uno acuerda su pago y su entrega:
```json
{ "mensaje": "Pedido enviado. Coordine el pago y la entrega con cada productor.", "id_pedido": 1, "total": 25120,
  "enlaces": [ { "id_productor": 1, "finca": "La Esperanza", "total": 6120, "enlace_whatsapp": "https://wa.me/57..." } ] }
```

**Cargar precios** – `POST /precios/csv` 🔒 (admin), multipart con el archivo en el campo `archivo`. Columnas: `producto,categoria,valor_kg,fecha` y, de forma opcional, `fuente`. Se acepta coma o punto y coma como separador, y la fecha va en formato `AAAA-MM-DD`. Hay un ejemplo en `docs/precios_ejemplo.csv`. Si alguna fila tiene errores no se carga nada, y la respuesta indica la línea y el problema.

**Administración** – todas las rutas `/admin/...` son solo para el administrador:
- `PATCH /admin/productores/:id/verificar` con `{ "verificado": true }` o `false`.
- `PATCH /admin/productos/:id/moderar` con `{ "oculto": true }` o `false`. Una publicación oculta no aparece en el catálogo y el productor no la puede reactivar.
- `GET /admin/reportes` devuelve los usuarios por rol, los productores verificados y pendientes, los productos por estado, las solicitudes por estado, los pedidos enviados con su valor total y los productos activos por categoría.

## Usuarios de prueba (datos del script de la base de datos)

Contraseña de todos: `Prueba2026*`

| Rol | Usuario |
|---|---|
| Administrador | `admin@ejemplo.test` |
| Productor | `productor1@ejemplo.test` … `productor6@ejemplo.test` |
| Comprador | `comprador1@ejemplo.test`, `comprador2@ejemplo.test` |
