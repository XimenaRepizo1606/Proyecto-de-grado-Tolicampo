# API ToliCampo (backend)

API REST en Node.js con Express y MySQL. La lista completa de rutas está en `../docs/API.md`.

## Instalación

```bash
npm install
cp .env.example .env    # Windows: copy .env.example .env
npm run dev             # modo desarrollo (se reinicia al guardar)
npm start               # modo producción
```

## Organización del código

```
src/
  server.js                 arranque del servidor
  app.js                    configuración de Express y rutas
  config/db.js              conexión a MySQL (pool)
  middlewares/auth.js       verificación del token JWT y de roles
  middlewares/errores.js    manejo central de errores
  config/subidas.js         subida de fotos (JPG, PNG o WEBP, máximo 2 MB)
  utils/validar.js          validación de datos de entrada
  utils/whatsapp.js         enlaces de WhatsApp (click to chat)
  modules/
    auth/                   Sprint 2 – registro e inicio de sesión (RF01, RF02)
    productores/            Sprint 2 – perfil del productor (RF03)
    productos/              Sprint 3 – publicar, editar, pausar y catálogo (RF04 a RF07)
    solicitudes/            Sprint 4 – contacto por WhatsApp y solicitudes (RF08, RF09)
    carrito/                Sprint 4 – carrito y envío del pedido por WhatsApp
    precios/                Sprint 4 – precios de referencia y carga de CSV (RF10, RF12)
    admin/                  Sprint 4 – verificar, moderar y reportes (RF11, RF13)
    catalogos/              categorías y veredas
```

## Seguridad aplicada (OWASP)

- Contraseñas guardadas con bcrypt (costo 10); nunca se devuelven al cliente.
- Tokens JWT con expiración (8 horas por defecto).
- Todas las consultas SQL usan parámetros (`?`), para evitar la inyección SQL.
- Validación de todos los datos que envía el cliente.
- Las fotos solo se aceptan como imagen, con un límite de 2 MB y un nombre aleatorio.
- Cada productor solo puede modificar sus propios productos y solicitudes; cada comprador, solo su carrito.
- El panel de administración exige el rol de administrador en todas sus rutas.
- El precio del carrito lo calcula el servidor; el cliente no puede enviar un precio diferente.
- Límite de 10 intentos de inicio de sesión cada 15 minutos.
- Cabeceras de seguridad con Helmet y CORS limitado a la dirección del frontend.
- El archivo `.env` con las claves no se sube a GitHub (está en `.gitignore`).
