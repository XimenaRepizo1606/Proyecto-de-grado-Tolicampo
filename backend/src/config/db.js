// Conexión a MySQL con un "pool" de conexiones (mysql2/promise).
// Todas las consultas usan parámetros (?) para evitar inyección SQL (OWASP A03).
const mysql = require('mysql2/promise');

const config = process.env.DATABASE_URL
  ? { uri: process.env.DATABASE_URL }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'tolicampo',
    };

const pool = mysql.createPool({
  ...config,
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
  decimalNumbers: true,
  dateStrings: ['DATE'], // las fechas tipo DATE llegan como '2026-10-16', sin zona horaria
});

module.exports = pool;
