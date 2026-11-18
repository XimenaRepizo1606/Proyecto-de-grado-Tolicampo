require('dotenv').config();
if (!process.env.JWT_SECRET) {
  console.error('Falta la variable JWT_SECRET en el archivo .env');
  process.exit(1);
}
const app = require('./app');
const PUERTO = process.env.PORT || 4000;
app.listen(PUERTO, () => console.log(`API ToliCampo escuchando en http://localhost:${PUERTO}`));
