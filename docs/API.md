# API REST de ToliCampo – Lista de rutas

Base local: `http://localhost:4000/api` · Base publicada: `https://<api-en-railway>/api`

Todas las respuestas son JSON. Los errores tienen la forma `{ "error": "mensaje" }`.
Las rutas marcadas con 🔒 necesitan la cabecera `Authorization: Bearer <token>`, que se recibe al registrarse o iniciar sesión.

**Estado:** ✅ implementada y probada · ⏳ pendiente

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
| ⏳ | GET | `/productos?categoria=&q=&min=&max=&municipio=&pagina=` | Todos | Catálogo con filtros y buscador (RF06) |
| ⏳ | GET | `/productos/ofertas` | Todos | Ofertas de la semana |
| ⏳ | GET | `/productos/:id` | Todos | Detalle con finca, municipio y verificado (RF07) |
| ⏳ | GET | `/productos/mios` 🔒 | Productor | Sus publicaciones |
| ⏳ | POST | `/productos` 🔒 | Productor | Publicar producto con foto (RF04) |
| ⏳ | PUT | `/productos/:id` 🔒 | Productor dueño | Editar producto (RF05) |
| ⏳ | PATCH | `/productos/:id/estado` 🔒 | Productor dueño | `{ "estado": "activo" \| "pausado" \| "agotado" }` (RF05) |

## Sprint 4 – Contacto, carrito, precios y administración (RF08 a RF13)

| Estado | Método | Ruta | Quién | Para qué |
|---|---|---|---|---|
| ⏳ | POST | `/solicitudes` 🔒 | Comprador | Crear solicitud; devuelve el enlace de WhatsApp (RF08) |
| ⏳ | GET | `/solicitudes/recibidas` 🔒 | Productor | Solicitudes de sus productos (RF09) |
| ⏳ | GET | `/solicitudes/enviadas` 🔒 | Comprador | Solicitudes que ha hecho |
| ⏳ | PATCH | `/solicitudes/:id/estado` 🔒 | Productor | `pendiente`, `atendida` o `cerrada` (RF09) |
| ⏳ | GET | `/carrito` 🔒 | Comprador | Carrito abierto con total |
| ⏳ | POST | `/carrito/items` 🔒 | Comprador | `{ "id_producto", "cantidad", "unidad" }` |
| ⏳ | PATCH | `/carrito/items/:id` 🔒 | Comprador | Cambiar cantidad |
| ⏳ | DELETE | `/carrito/items/:id` 🔒 | Comprador | Quitar producto |
| ⏳ | POST | `/carrito/enviar` 🔒 | Comprador | Cierra el pedido y devuelve un enlace de WhatsApp por productor |
| ⏳ | GET | `/precios` | Todos | Precios de referencia SIPSA (RF10) |
| ⏳ | POST | `/precios/csv` 🔒 | Admin | Cargar precios desde un CSV (RF12) |
| ⏳ | GET | `/admin/productores?verificado=0` 🔒 | Admin | Productores por verificar (RF11) |
| ⏳ | PATCH | `/admin/productores/:id/verificar` 🔒 | Admin | Marcar como verificado (RF11) |
| ⏳ | PATCH | `/admin/productos/:id/moderar` 🔒 | Admin | Ocultar o mostrar una publicación (RF11) |
| ⏳ | GET | `/admin/reportes` 🔒 | Admin | Totales de usuarios, productos y solicitudes (RF13) |

## Usuarios de prueba (datos del script de la base de datos)

Contraseña de todos: `Prueba2026*`

| Rol | Usuario |
|---|---|
| Administrador | `admin@ejemplo.test` |
| Productor | `productor1@ejemplo.test` … `productor6@ejemplo.test` |
| Comprador | `comprador1@ejemplo.test`, `comprador2@ejemplo.test` |
