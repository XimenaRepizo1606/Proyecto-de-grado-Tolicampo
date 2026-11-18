DROP DATABASE IF EXISTS tolicampo;
CREATE DATABASE tolicampo
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE tolicampo;
SET NAMES utf8mb4;
-- ---------------------------------------------------------------------
-- 1. VEREDA (Figura 2)
-- Lugar rural donde queda la finca.
-- AJUSTE: se agrega "municipio" porque las tarjetas del prototipo
-- (Figuras 5 y 8) muestran "Finca · Municipio, Tolima" y el registro
-- (Figura 9) pide municipio. DEFAULT 'Ibagué' por la delimitación.
-- ---------------------------------------------------------------------
CREATE TABLE vereda (
  id_vereda     INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre        VARCHAR(100) NOT NULL,
  corregimiento VARCHAR(100) NOT NULL,
  municipio     VARCHAR(60)  NOT NULL DEFAULT 'Ibagué',
  PRIMARY KEY (id_vereda),
  -- Evita registrar dos veces la misma vereda
  UNIQUE KEY uq_vereda (nombre, corregimiento, municipio)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 2. CATEGORIA (Figura 2; las 7 categorías salen de la Figura 4)
-- ---------------------------------------------------------------------
CREATE TABLE categoria (
  id_categoria INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre       VARCHAR(60)  NOT NULL,
  PRIMARY KEY (id_categoria),
  UNIQUE KEY uq_categoria_nombre (nombre)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 3. USUARIO (Figura 2; RF01, RF02, RNF05, RNF06)
-- Un solo tipo de usuario con un "rol" (productor, comprador, admin).
-- * contrasena_hash guarda el hash bcrypt (60 caracteres), NUNCA la clave.
-- * correo y telefono: la Figura 2 muestra "correo / teléfono" y RF01
--   dice "teléfono o correo"; por eso ambos aceptan NULL, pero el CHECK
--   obliga a tener al menos uno.
-- * acepta_tratamiento_datos: Ley 1581; el CHECK impide registrar a
--   alguien que no aceptó (RF01 "aceptación obligatoria", RNF06).
-- ---------------------------------------------------------------------
CREATE TABLE usuario (
  id_usuario               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre                   VARCHAR(100) NOT NULL,
  correo                   VARCHAR(120) NULL,
  telefono                 VARCHAR(15)  NULL,
  contrasena_hash          VARCHAR(255) NOT NULL,
  rol                      ENUM('productor','comprador','admin') NOT NULL DEFAULT 'comprador',
  acepta_tratamiento_datos TINYINT(1)   NOT NULL DEFAULT 0,
  fecha_registro           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario),
  UNIQUE KEY uq_usuario_correo (correo),
  UNIQUE KEY uq_usuario_telefono (telefono),
  CONSTRAINT chk_usuario_contacto CHECK (correo IS NOT NULL OR telefono IS NOT NULL),
  CONSTRAINT chk_usuario_datos    CHECK (acepta_tratamiento_datos = 1)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 4. PERFIL_PRODUCTOR (Figura 2; RF03, RF11, HU06)
-- Relación 1 : 0..1 con usuario (UNIQUE en id_usuario).
-- AJUSTES respecto a la Figura 2:
--   * cultivos   -> RF03 lo pide y el registro (Figura 9) lo recoge.
--   * verificado -> RF11 / HU06 / insignia "Productor verificado".
-- ---------------------------------------------------------------------
CREATE TABLE perfil_productor (
  id_productor INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario   INT UNSIGNED NOT NULL,
  id_vereda    INT UNSIGNED NOT NULL,
  nombre_finca VARCHAR(100) NOT NULL,
  cultivos     VARCHAR(255) NOT NULL,
  descripcion  TEXT         NULL,
  verificado   TINYINT(1)   NOT NULL DEFAULT 0,
  PRIMARY KEY (id_productor),
  UNIQUE KEY uq_perfil_usuario (id_usuario),
  CONSTRAINT fk_perfil_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuario (id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_perfil_vereda FOREIGN KEY (id_vereda)
    REFERENCES vereda (id_vereda) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 5. PUBLICACION_PRODUCTO (Figura 2; RF04, RF05, RF06)
-- AJUSTES respecto a la Figura 2:
--   * estado agrega 'pausado' (RF05: "editar, pausar o marcar agotado")
--     y 'oculto' (el administrador modera publicaciones, RF11).
--   * descuento_pct: porcentaje de descuento para "Ofertas de la semana"
--     (Figura 5). precio_unitario guarda el precio SIN descuento;
--     precio final = precio_unitario * (1 - descuento_pct / 100).
--   * unidad: kilo, libra, arroba, bulto (Tabla 14 y Figuras 5/8).
-- foto_url acepta NULL (en el formulario de la Figura 7 la foto es opcional).
-- ---------------------------------------------------------------------
CREATE TABLE publicacion_producto (
  id_producto         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  id_productor        INT UNSIGNED  NOT NULL,
  id_categoria        INT UNSIGNED  NOT NULL,
  nombre              VARCHAR(100)  NOT NULL,
  precio_unitario     DECIMAL(12,2) NOT NULL,
  unidad              ENUM('kilo','libra','arroba','bulto') NOT NULL DEFAULT 'kilo',
  descuento_pct       DECIMAL(5,2)  NOT NULL DEFAULT 0,
  cantidad_disponible DECIMAL(10,2) NOT NULL DEFAULT 0,
  foto_url            VARCHAR(255)  NULL,
  estado              ENUM('activo','pausado','agotado','oculto') NOT NULL DEFAULT 'activo',
  PRIMARY KEY (id_producto),
  KEY idx_publicacion_nombre (nombre),      -- acelera el buscador (RF06)
  KEY idx_publicacion_estado (estado),
  CONSTRAINT fk_publicacion_productor FOREIGN KEY (id_productor)
    REFERENCES perfil_productor (id_productor) ON DELETE CASCADE,
  CONSTRAINT fk_publicacion_categoria FOREIGN KEY (id_categoria)
    REFERENCES categoria (id_categoria) ON DELETE RESTRICT,
  CONSTRAINT chk_publicacion_precio   CHECK (precio_unitario > 0),
  CONSTRAINT chk_publicacion_cantidad CHECK (cantidad_disponible >= 0),
  CONSTRAINT chk_publicacion_descuento CHECK (descuento_pct >= 0 AND descuento_pct < 100)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 6. PRECIO_REFERENCIA (Figura 2; RF10, RF12, HU05)
-- AJUSTE: la Figura 2 solo relaciona el precio con la CATEGORÍA, pero
-- RF10 y la Tabla 8 son POR PRODUCTO (varios productos por categoría).
-- Se agrega nombre_producto. "fuente / fecha" de la Figura 2 se separa
-- en dos columnas: fuente y fecha_dato.
-- ---------------------------------------------------------------------
CREATE TABLE precio_referencia (
  id_precio       INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  id_categoria    INT UNSIGNED  NOT NULL,
  nombre_producto VARCHAR(100)  NOT NULL,
  valor_kg        DECIMAL(12,2) NOT NULL,
  fuente          VARCHAR(100)  NOT NULL DEFAULT 'SIPSA-DANE',
  fecha_dato      DATE          NOT NULL,
  PRIMARY KEY (id_precio),
  -- Un precio por producto, fuente y fecha (permite guardar historial)
  UNIQUE KEY uq_precio_ref (nombre_producto, fuente, fecha_dato),
  CONSTRAINT fk_precio_categoria FOREIGN KEY (id_categoria)
    REFERENCES categoria (id_categoria) ON DELETE RESTRICT,
  CONSTRAINT chk_precio_valor CHECK (valor_kg > 0)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 7. SOLICITUD_CONTACTO (Figura 2; RF08, RF09, HU04)
-- La Figura 2 dice "mensaje / cantidad" y "estado / fecha": se separan
-- en columnas distintas. Estados según RF09.
-- ---------------------------------------------------------------------
CREATE TABLE solicitud_contacto (
  id_solicitud    INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  id_producto     INT UNSIGNED  NOT NULL,
  id_comprador    INT UNSIGNED  NOT NULL,   -- apunta a usuario.id_usuario (rol comprador)
  mensaje         VARCHAR(500)  NULL,
  cantidad        DECIMAL(10,2) NULL,
  estado          ENUM('pendiente','atendida','cerrada') NOT NULL DEFAULT 'pendiente',
  fecha_solicitud DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_solicitud),
  KEY idx_solicitud_estado (estado),
  CONSTRAINT fk_solicitud_producto FOREIGN KEY (id_producto)
    REFERENCES publicacion_producto (id_producto) ON DELETE CASCADE,
  CONSTRAINT fk_solicitud_comprador FOREIGN KEY (id_comprador)
    REFERENCES usuario (id_usuario) ON DELETE CASCADE,
  CONSTRAINT chk_solicitud_cantidad CHECK (cantidad IS NULL OR cantidad > 0)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 8. PEDIDO (NUEVA, pedida por el equipo; carrito de la Figura 8)
-- Un pedido en estado 'carrito' es el carrito abierto del comprador;
-- al pulsar "Enviar pedido por WhatsApp" pasa a 'enviado'.
-- No hay pagos en línea (Delimitación temática), por eso no hay
-- columnas de pago. El total se calcula sumando detalle_pedido.subtotal.
-- ---------------------------------------------------------------------
CREATE TABLE pedido (
  id_pedido      INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_comprador   INT UNSIGNED NOT NULL,
  estado         ENUM('carrito','enviado') NOT NULL DEFAULT 'carrito',
  fecha_creacion DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_envio    DATETIME     NULL,
  PRIMARY KEY (id_pedido),
  KEY idx_pedido_comprador (id_comprador, estado),
  CONSTRAINT fk_pedido_comprador FOREIGN KEY (id_comprador)
    REFERENCES usuario (id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 9. DETALLE_PEDIDO (NUEVA): una fila por producto dentro del pedido.
-- precio_unitario guarda el precio al momento de agregar al carrito
-- (por la unidad elegida), así un cambio posterior de precio no altera
-- pedidos viejos. subtotal se calcula solo (columna generada).
-- ---------------------------------------------------------------------
CREATE TABLE detalle_pedido (
  id_detalle      INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  id_pedido       INT UNSIGNED  NOT NULL,
  id_producto     INT UNSIGNED  NOT NULL,
  cantidad        DECIMAL(10,2) NOT NULL,
  unidad          ENUM('kilo','libra','arroba','bulto') NOT NULL DEFAULT 'kilo',
  precio_unitario DECIMAL(12,2) NOT NULL,
  subtotal        DECIMAL(14,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
  PRIMARY KEY (id_detalle),
  -- Un producto aparece una sola vez por pedido (si lo agregan de nuevo, se suma la cantidad)
  UNIQUE KEY uq_detalle_producto (id_pedido, id_producto),
  CONSTRAINT fk_detalle_pedido FOREIGN KEY (id_pedido)
    REFERENCES pedido (id_pedido) ON DELETE CASCADE,
  CONSTRAINT fk_detalle_producto FOREIGN KEY (id_producto)
    REFERENCES publicacion_producto (id_producto) ON DELETE RESTRICT,
  CONSTRAINT chk_detalle_cantidad CHECK (cantidad > 0),
  CONSTRAINT chk_detalle_precio   CHECK (precio_unitario > 0)
) ENGINE=InnoDB;

-- =====================================================================
-- DATOS DE PRUEBA
-- =====================================================================

-- Categorías: nombres exactos de la Figura 4 ---------------------------
INSERT INTO categoria (id_categoria, nombre) VALUES
  (1, 'Verduras'),
  (2, 'Hortalizas'),
  (3, 'Granos'),
  (4, 'Frutas'),
  (5, 'Cárnicos'),
  (6, 'Lácteos, quesos y huevos'),
  (7, 'Pulpas de fruta');

-- Veredas: EJEMPLO. El documento NO nombra ninguna vereda real. -------
-- Los municipios sí salen de las Figuras 5 y 8 (Ibagué, Rioblanco,
-- Cajamarca, Espinal, Fresno).
INSERT INTO vereda (id_vereda, nombre, corregimiento, municipio) VALUES
  (1, 'Vereda de ejemplo 1', 'Corregimiento de ejemplo A', 'Ibagué'),
  (2, 'Vereda de ejemplo 2', 'Corregimiento de ejemplo B', 'Ibagué'),
  (3, 'Vereda de ejemplo 3', 'Corregimiento de ejemplo C', 'Rioblanco'),
  (4, 'Vereda de ejemplo 4', 'Corregimiento de ejemplo D', 'Cajamarca'),
  (5, 'Vereda de ejemplo 5', 'Corregimiento de ejemplo E', 'Espinal'),
  (6, 'Vereda de ejemplo 6', 'Corregimiento de ejemplo F', 'Fresno');

-- Usuarios: EJEMPLO (nombres, correos y celulares inventados). --------
-- Contraseña de TODOS los usuarios de prueba: Prueba2026*
-- (hash bcrypt $2b$ con costo 10, como pide RNF05).
INSERT INTO usuario
  (id_usuario, nombre, correo, telefono, contrasena_hash, rol, acepta_tratamiento_datos) VALUES
  (1, 'Administrador de ejemplo', 'admin@ejemplo.test',      NULL,         '$2b$10$E5YNDkRd34r3WG/SMcsctOE.AuXthif4zJYcuOY2VlkPK2yj.e19C', 'admin',     1),
  (2, 'Productor de ejemplo 1',   'productor1@ejemplo.test', '3000000001', '$2b$10$E5YNDkRd34r3WG/SMcsctOE.AuXthif4zJYcuOY2VlkPK2yj.e19C', 'productor', 1),
  (3, 'Productor de ejemplo 2',   'productor2@ejemplo.test', '3000000002', '$2b$10$E5YNDkRd34r3WG/SMcsctOE.AuXthif4zJYcuOY2VlkPK2yj.e19C', 'productor', 1),
  (4, 'Productor de ejemplo 3',   'productor3@ejemplo.test', '3000000003', '$2b$10$E5YNDkRd34r3WG/SMcsctOE.AuXthif4zJYcuOY2VlkPK2yj.e19C', 'productor', 1),
  (5, 'Productor de ejemplo 4',   'productor4@ejemplo.test', '3000000004', '$2b$10$E5YNDkRd34r3WG/SMcsctOE.AuXthif4zJYcuOY2VlkPK2yj.e19C', 'productor', 1),
  (6, 'Productor de ejemplo 5',   'productor5@ejemplo.test', '3000000005', '$2b$10$E5YNDkRd34r3WG/SMcsctOE.AuXthif4zJYcuOY2VlkPK2yj.e19C', 'productor', 1),
  (7, 'Productor de ejemplo 6',   'productor6@ejemplo.test', '3000000006', '$2b$10$E5YNDkRd34r3WG/SMcsctOE.AuXthif4zJYcuOY2VlkPK2yj.e19C', 'productor', 1),
  (8, 'Comprador de ejemplo 1',   'comprador1@ejemplo.test', '3000000007', '$2b$10$E5YNDkRd34r3WG/SMcsctOE.AuXthif4zJYcuOY2VlkPK2yj.e19C', 'comprador', 1),
  (9, 'Comprador de ejemplo 2',   'comprador2@ejemplo.test', '3000000008', '$2b$10$E5YNDkRd34r3WG/SMcsctOE.AuXthif4zJYcuOY2VlkPK2yj.e19C', 'comprador', 1);

-- Productor 7: EJEMPLO. Dueño de los productos que en el documento no
-- tienen finca asignada (Figura 6 y Tabla 8).
INSERT INTO usuario
  (id_usuario, nombre, correo, telefono, contrasena_hash, rol, acepta_tratamiento_datos) VALUES
  (10, 'Productor de ejemplo 7', 'productor7@ejemplo.test', '3000000009', '$2b$10$E5YNDkRd34r3WG/SMcsctOE.AuXthif4zJYcuOY2VlkPK2yj.e19C', 'productor', 1);

-- Perfiles de productor --------------------------------------------------
-- Nombres de finca, municipios y productos: Figuras 5 y 8 del documento.
-- verificado = 1 en todos porque todas las tarjetas muestran
-- "Productor verificado".
INSERT INTO perfil_productor
  (id_productor, id_usuario, id_vereda, nombre_finca, cultivos, descripcion, verificado) VALUES
  (1, 2, 1, 'La Esperanza',   'Tomate chonto, tomate cherry', 'Perfil de ejemplo', 1),  -- Ibagué
  (2, 3, 3, 'Las Brisas',     'Lenteja',                      'Perfil de ejemplo', 1),  -- Rioblanco
  (3, 4, 2, 'Dulce Amanecer', 'Fresa',                        'Perfil de ejemplo', 1),  -- Ibagué
  (4, 5, 4, 'Mora Real',      'Pulpa de tomate de árbol',     'Perfil de ejemplo', 1),  -- Cajamarca
  (5, 6, 5, 'Los Cítricos',   'Limón Tahití',                 'Perfil de ejemplo', 1),  -- Espinal
  (6, 7, 6, 'Valle Fértil',   'Manzana verde',                'Perfil de ejemplo', 1);  -- Fresno

-- Perfil 7: EJEMPLO (finca inventada) para los productos sin finca en el documento.
INSERT INTO perfil_productor
  (id_productor, id_usuario, id_vereda, nombre_finca, cultivos, descripcion, verificado) VALUES
  (7, 10, 1, 'Finca de ejemplo', 'Plátano hartón, papa criolla, cebolla junca, aguacate papelillo, mora, lulo', 'Perfil de ejemplo', 1);

-- Publicaciones: producto, finca y precio por kilo salen de las
-- Figuras 5 y 8. cantidad_disponible = 50 es un valor EJEMPLO (no está
-- en el documento). foto_url queda NULL (nombres de imagen no definidos).
-- Categoría de Tomate cherry = Frutas porque así aparece en la Figura 8.
INSERT INTO publicacion_producto
  (id_producto, id_productor, id_categoria, nombre, precio_unitario, unidad, descuento_pct, cantidad_disponible, foto_url, estado) VALUES
  -- Ofertas de la semana (Figura 5): precio SIN descuento y su porcentaje.
  -- Precio final: 4.800 -15% = 4.080 | 6.900 -12% = 6.072 | 9.500 -20% = 7.600 | 13.000 -15% = 11.050
  (1, 1, 1, 'Tomate chonto',            4800.00,  'kilo', 15, 50, NULL, 'activo'),
  (2, 2, 3, 'Lenteja',                  6900.00,  'kilo', 12, 50, NULL, 'activo'),
  (3, 3, 4, 'Fresa',                    9500.00,  'kilo', 20, 50, NULL, 'activo'),
  (4, 4, 7, 'Pulpa de tomate de árbol', 13000.00, 'kilo', 15, 50, NULL, 'activo'),
  -- Productos sin oferta
  (5, 5, 4, 'Limón Tahití',             3800.00,  'kilo', 0,  50, NULL, 'activo'),
  (6, 6, 4, 'Manzana verde',            6200.00,  'kilo', 0,  50, NULL, 'activo'),
  (7, 1, 4, 'Tomate cherry',            7400.00,  'kilo', 0,  50, NULL, 'activo'),
  -- Productos con el MISMO nombre y categoría que en precio_referencia.
  -- Precios de venta tomados de la Figura 6 (EJEMPLO, sin descuento).
  (8,  7, 1, 'Plátano hartón',     2600.00, 'kilo', 0, 50, NULL, 'activo'),
  (9,  7, 1, 'Papa criolla',       4500.00, 'kilo', 0, 50, NULL, 'activo'),
  (10, 7, 4, 'Aguacate papelillo', 9000.00, 'kilo', 0, 50, NULL, 'activo'),
  (11, 7, 4, 'Mora',               6800.00, 'kilo', 0, 50, NULL, 'activo'),
  (12, 7, 4, 'Lulo',               5800.00, 'kilo', 0, 50, NULL, 'activo'),
  (13, 7, 2, 'Cebolla junca',      2000.00, 'kilo', 0, 50, NULL, 'activo');

-- Precios de referencia REALES: columna "Precio mayorista por kg (SIPSA)"
-- de la Tabla 8, fecha del dato 16/10/2026 (Figura 6 y página 42).
-- Los nombres son los de la Tabla 8.
-- Las categorías de plátano, cebolla y papa criolla son PROVISIONALES
-- (el documento no las asigna).
INSERT INTO precio_referencia
  (id_precio, id_categoria, nombre_producto, valor_kg, fuente, fecha_dato) VALUES
  (1, 1, 'Plátano hartón',     2346.00, 'SIPSA-DANE', '2026-10-16'),
  (2, 1, 'Tomate chonto',      3500.00, 'SIPSA-DANE', '2026-10-16'),
  (3, 2, 'Cebolla junca',      1604.00, 'SIPSA-DANE', '2026-10-16'),
  (4, 1, 'Papa criolla',       4000.00, 'SIPSA-DANE', '2026-10-16'),
  (5, 4, 'Aguacate papelillo', 8125.00, 'SIPSA-DANE', '2026-10-16'),
  (6, 4, 'Mora',               6000.00, 'SIPSA-DANE', '2026-10-16'),
  (7, 4, 'Lulo',               5200.00, 'SIPSA-DANE', '2026-10-16');

-- Solicitudes de contacto: EJEMPLO (mensajes inventados), una por estado.
INSERT INTO solicitud_contacto
  (id_solicitud, id_producto, id_comprador, mensaje, cantidad, estado) VALUES
  (1, 1, 8, 'Hola, ¿tiene tomate chonto disponible esta semana? (ejemplo)', 5.00,  'pendiente'),
  (2, 3, 9, 'Quiero fresa para mi restaurante (ejemplo)',                   2.00,  'atendida'),
  (3, 2, 8, 'Necesito lenteja para una tienda (ejemplo)',                   10.00, 'cerrada');

-- Pedidos: EJEMPLO.
-- Pedido 1: carrito abierto del comprador 1 (Fresa + Limón = $11.400).
-- Pedido 2: pedido ya enviado del comprador 2; el tomate cherry se pide
-- por LIBRA a $3.700 (= $7.400 / 2, como en la Figura 8).
INSERT INTO pedido (id_pedido, id_comprador, estado, fecha_envio) VALUES
  (1, 8, 'carrito', NULL),
  (2, 9, 'enviado', NOW());

INSERT INTO detalle_pedido
  (id_detalle, id_pedido, id_producto, cantidad, unidad, precio_unitario) VALUES
  (1, 1, 3, 1.00, 'kilo',  7600.00),
  (2, 1, 5, 1.00, 'kilo',  3800.00),
  (3, 2, 1, 2.00, 'kilo',  4080.00),
  (4, 2, 7, 1.00, 'libra', 3700.00);

-- =====================================================================
-- CONSULTAS DE VERIFICACIÓN (puedes ejecutarlas una por una)
-- =====================================================================

-- a) Catálogo con finca, municipio y marca de verificado (RF06, RF07)
SELECT p.nombre AS producto, c.nombre AS categoria, p.precio_unitario, p.unidad,
       f.nombre_finca, v.municipio, f.verificado
FROM publicacion_producto p
JOIN categoria c        ON c.id_categoria = p.id_categoria
JOIN perfil_productor f ON f.id_productor = p.id_productor
JOIN vereda v           ON v.id_vereda    = f.id_vereda
WHERE p.estado = 'activo'
ORDER BY c.nombre, p.nombre;

-- b) Precio ToliCampo frente al mayorista cuando el nombre coincide (RF10)
SELECT p.nombre, ROUND(p.precio_unitario * (1 - p.descuento_pct / 100), 2) AS precio_tolicampo_kg,
       r.valor_kg AS mayorista_kg, r.fecha_dato
FROM publicacion_producto p
JOIN precio_referencia r ON r.nombre_producto = p.nombre
WHERE p.unidad = 'kilo';

-- c) Total aproximado de cada pedido (carrito de la Figura 8)
SELECT d.id_pedido, pe.estado, SUM(d.subtotal) AS total_aproximado
FROM detalle_pedido d
JOIN pedido pe ON pe.id_pedido = d.id_pedido
GROUP BY d.id_pedido, pe.estado;
