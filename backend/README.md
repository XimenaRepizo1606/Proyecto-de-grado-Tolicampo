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
  utils/validar.js          validación de datos de entrada
  modules/
    auth/                   Sprint 2 – registro e inicio de sesión (RF01, RF02)
    productores/            Sprint 2 – perfil del productor (RF03)
    catalogos/              categorías y veredas
```

## Seguridad aplicada (OWASP)

- Contraseñas guardadas con bcrypt (costo 10); nunca se devuelven al cliente.
- Tokens JWT con expiración (8 horas por defecto).
- Todas las consultas SQL usan parámetros (`?`), para evitar la inyección SQL.
- Validación de todos los datos que envía el cliente.
- Límite de 10 intentos de inicio de sesión cada 15 minutos.
- Cabeceras de seguridad con Helmet y CORS limitado a la dirección del frontend.
- El archivo `.env` con las claves no se sube a GitHub (está en `.gitignore`).
