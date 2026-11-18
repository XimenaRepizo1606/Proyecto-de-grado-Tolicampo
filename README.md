# ToliCampo

Plataforma web para la comercialización agrícola directa entre pequeños productores de Ibagué y compradores locales.
Proyecto de grado – Ingeniería de Sistemas, UNAD (Grupo 71).

Autores: Víctor Manuel Bonilla Escobar y Ximena Del Pilar Repizo Tovar.

## Estructura

| Carpeta | Contenido |
|---|---|
| `database/` | Script de MySQL con las tablas y los datos de prueba |
| `backend/` | API REST en Node.js con Express |
| `frontend/` | Aplicación en React con Tailwind (PWA) |
| `docs/` | Lista de rutas de la API (`API.md`) y colección de pruebas |

## Cómo ejecutar el proyecto en local

1. **Base de datos:** abrir `database/tolicampo_bd.sql` en MySQL Workbench y ejecutarlo completo.
2. **API:**
   ```bash
   cd backend
   npm install
   cp .env.example .env      # en Windows: copy .env.example .env
   # editar .env con el usuario y la clave de MySQL
   npm run dev
   ```
   La API queda en `http://localhost:4000/api`. Comprobar con `http://localhost:4000/api/salud`.
3. **Frontend:** ver `frontend/README.md`.

## Tecnologías

MySQL 8 · Node.js 20 · Express · JWT · bcrypt · React · Tailwind CSS · Vercel · Railway
