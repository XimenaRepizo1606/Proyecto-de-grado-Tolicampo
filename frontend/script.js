/* ===== DATOS ===== */
const IMG = 'imagenes/';
const CATEGORIAS = {
  verduras:   { t: 'Verduras',          img: ['tomate.jpg'],        d: 'Verduras de hoja, raíz y fruto cosechadas esta semana en el Tolima.' },
  hortalizas: { t: 'Hortalizas',        img: ['banner.jpg', '#', '35% 29%'], d: 'Hortalizas frescas para ensaladas, sopas y guisos.' },
  granos:     { t: 'Granos',            img: ['legumbres.jpg'],     d: 'Fríjoles, lentejas, garbanzos, maíz y el café de nuestras montañas.' },
  frutas:     { t: 'Frutas',            img: ['fresas.jpg'],        d: 'Frutas dulces y jugosas, directas del árbol a tu casa.' },
  carnicos:   { t: 'Cárnicos',          img: ['carnes.jpg'],        d: 'Carnes de res, cerdo y pollo de fincas con cuidado en el campo.' },
  lacteos:    { t: 'Lácteos, quesos y huevos', img: ['leche.jpg'],  d: 'Leche fresca, quesos artesanales, mantequilla y huevos criollos.' },
  pulpas:     { t: 'Pulpas de fruta',   img: ['pulpas_de_frutas.jpg'], d: 'Pulpa 100 % fruta, sin azúcar añadida, lista para jugos y postres.' }
};

// p(id, categoría, nombre, finca, municipio, precio por kilo (COP), imagen, posición, zoom, % descuento)
const p = (id, cat, n, finca, mun, kilo, img, pos = 'center', zoom = 'cover', off = 0) =>
  ({ id, cat, n, finca, mun, kilo, img, pos, zoom, off });
const Z = '380%'; // recorte ampliado de las imágenes de mezcla

const PRODUCTOS = [
  // Verduras
  p('v1','verduras','Tomate chonto','Finca La Esperanza','Ibagué',4800,'tomate.jpg','center','cover',15),
  p('v2','verduras','Cebolla roja','Finca El Mirador','Cajamarca',3900,'cebolla_roja.jpg'),
  p('v3','verduras','Zanahoria','Finca Los Naranjos','Herveo',2800,'banner.jpg','12% 40%',Z),
  p('v4','verduras','Papa pastusa','Finca Buenavista','Villahermosa',2500,'banner.jpg','40% 43%',Z),
  p('v5','verduras','Pepino cohombro','Finca San Rafael','Armero Guayabal',3200,'banner.jpg','40% 52%',Z),
  p('v6','verduras','Berenjena','Finca El Trébol','Mariquita',5200,'banner.jpg','90% 22%',Z),
  p('v7','verduras','Pimentón rojo','Finca Las Acacias','Espinal',6500,'banner.jpg','15% 12%',Z),
  // Hortalizas
  p('h1','hortalizas','Coliflor','Finca Alto Bonito','Anzoátegui',5400,'banner.jpg','35% 29%',Z),
  p('h2','hortalizas','Brócoli','Finca Monte Verde','Santa Isabel',6800,'banner.jpg','18% 53%',Z,10),
  p('h3','hortalizas','Cilantro fresco','Finca La Cascada','Líbano',7000,'banner.jpg','85% 85%',Z),
  p('h4','hortalizas','Cebolla larga','Finca El Rosal','Cajamarca',4200,'banner.jpg','65% 62%',Z),
  p('h5','hortalizas','Habichuela','Finca Villa Clara','Rovira',4600,'banner.jpg','10% 27%',Z),
  p('h6','hortalizas','Ají picante','Finca Sol Naciente','Natagaima',9000,'banner.jpg','40% 68%',Z),
  // Granos
  p('g1','granos','Fríjol cargamanto rojo','Finca Cerro Azul','Planadas',9800,'legumbres.jpg','8% 18%',Z),
  p('g2','granos','Fríjol negro','Finca La Palmita','Chaparral',8600,'legumbres.jpg','85% 8%',Z),
  p('g3','granos','Lenteja','Finca Las Brisas','Rioblanco',6900,'legumbres.jpg','50% 40%',Z,12),
  p('g4','granos','Lenteja roja','Finca El Edén','Ortega',7800,'legumbres.jpg','55% 72%',Z),
  p('g5','granos','Garbanzo','Finca Pie de Monte','Coyaima',8200,'legumbres.jpg','25% 12%',Z),
  p('g6','granos','Maíz tierno (mazorca)','Finca Los Alpes','Guamo',3600,'banner.jpg','62% 43%',Z),
  p('g7','granos','Café tostado en grano','Finca Alto del Café','Planadas',32000,'cafe.jpg','center','cover',10),
  // Frutas
  p('f1','frutas','Fresa','Finca Dulce Amanecer','Ibagué',9500,'fresas.jpg','center','cover',20),
  p('f2','frutas','Limón Tahití','Finca Los Cítricos','Espinal',3800,'banner.jpg','62% 72%',Z),
  p('f3','frutas','Manzana verde','Finca Valle Fértil','Fresno',6200,'banner.jpg','78% 3%',Z),
  p('f4','frutas','Tomate cherry','Finca La Esperanza','Ibagué',7400,'tomate.jpg','70% 30%','250%'),
  // Cárnicos
  p('c1','carnicos','Pollo campesino entero','Finca El Gallo Fino','Alvarado',13500,'carnes.jpg','55% 35%',Z),
  p('c2','carnicos','Pechuga de pollo','Finca El Gallo Fino','Alvarado',17800,'carnes.jpg','55% 62%',Z,8),
  p('c3','carnicos','Costilla de cerdo','Finca Porcícola San José','Melgar',19500,'carnes.jpg','82% 10%',Z),
  p('c4','carnicos','Carne de res para guisar','Hacienda Los Samanes','Honda',24500,'carnes.jpg','22% 28%',Z),
  p('c5','carnicos','Chorizo artesanal','Finca La Ceiba','Purificación',21000,'carnes.jpg','25% 88%',Z),
  p('c6','carnicos','Carne molida para hamburguesa','Hacienda Los Samanes','Honda',22000,'carnes.jpg','10% 86%',Z),
  // Lácteos, quesos y huevos
  p('l1','lacteos','Leche fresca (litro)','Finca Lácteos del Combeima','Ibagué',3200,'leche.jpg','55% 15%',Z),
  p('l2','lacteos','Queso campesino','Finca Lácteos del Combeima','Ibagué',18000,'leche.jpg','22% 55%',Z),
  p('l3','lacteos','Mantequilla artesanal','Finca La Vaquita','Ataco',20000,'leche.jpg','40% 68%',Z),
  p('l4','lacteos','Huevos criollos (kilo)','Finca Granja Feliz','Lérida',9500,'leche.jpg','85% 85%',Z,10),
  // Pulpas
  p('p1','pulpas','Pulpa de fresa','Procesadora Frutas del Tolima','Ibagué',14000,'pulpas_de_frutas.jpg','8% 62%',Z),
  p('p2','pulpas','Pulpa de lulo','Procesadora Frutas del Tolima','Ibagué',15500,'pulpas_de_frutas.jpg','28% 62%',Z),
  p('p3','pulpas','Pulpa de tomate de árbol','Finca Mora Real','Cajamarca',13000,'pulpas_de_frutas.jpg','47% 62%',Z,15),
  p('p4','pulpas','Pulpa de mango','Finca Los Mangos','Guamo',12500,'pulpas_de_frutas.jpg','72% 62%',Z),
  p('p5','pulpas','Pulpa de maracuyá','Finca El Paraíso','Prado',16000,'pulpas_de_frutas.jpg','92% 62%',Z)
];

const SLIDES = [
  ['banner.jpg','Verduras y hortalizas','Colores y sabores de la huerta tolimense','verduras'],
  ['fresas.jpg','Fresas de Ibagué','Dulces, rojas y recién cosechadas','frutas'],
  ['cafe.jpg','Café de Planadas','Granos de montaña tostados con cuidado','granos'],
  ['leche.jpg','Del establo a tu nevera','Leche, quesos y huevos de finca','lacteos'],
  ['pulpas_de_frutas.jpg','Pulpas 100 % fruta','Jugos naturales listos en segundos','pulpas'],
  ['carnes.jpg','Carnes frescas','Res, cerdo y pollo de fincas aliadas','carnicos']
];

const RESENAS = [
  ['Marcela Rojas','Ibagué',5,'Los tomates y la cebolla llegaron frescos y con un sabor que no encuentro en el supermercado.'],
  ['Carlos Quintero','Espinal',5,'El café de Planadas es excelente. Ya hice mi segundo pedido para la familia.'],
  ['Lucía Barrero','Honda',4,'Muy buenas las pulpas de fruta, solo me gustaría que hubiera más sabores.'],
  ['Andrés Peña','Melgar',5,'Me encanta saber de qué finca viene cada producto. Se nota la calidad.']
];

/* ===== UTILIDADES ===== */
const $ = s => document.querySelector(s);
const peso = n => '$' + Math.round(n).toLocaleString('es-CO');
const precioUnidad = (prod, u) => {
  const kilo = prod.kilo * (1 - prod.off / 100);
  return u === 'lb' ? Math.round(kilo / 2) : Math.round(kilo);
};
const foto = (prod, extra = '') =>
  `<div class="foto" role="img" aria-label="${prod.n}" style="background-image:url('${IMG}${prod.img}');background-size:${prod.zoom};background-position:${prod.pos}">${extra}</div>`;
const estrellas = n => '★'.repeat(n) + '☆'.repeat(5 - n);

/* ===== TARJETAS ===== */
function tarjeta(prod) {
  const kilo = precioUnidad(prod, 'kg'), lb = precioUnidad(prod, 'lb');
  const oferta = prod.off ? `<span class="etiqueta">-${prod.off}%</span>` : '';
  const antes = prod.off ? `<span class="tachado">${peso(prod.kilo)}</span> ` : '';
  return `<article class="tarjeta">
    ${foto(prod, oferta)}
    <div class="info">
      <h3>${prod.n}</h3>
      <span class="finca">${prod.finca} · ${prod.mun}, Tolima</span>
      <span class="precios">${antes}${peso(kilo)} <small>/ kilo</small></span>
      <span class="precios">${peso(lb)} <small>/ libra</small></span>
      <div class="compra">
        <select aria-label="Unidad de venta" id="u-${prod.id}">
          <option value="kg">Kilo</option><option value="lb">Libra</option>
        </select>
        <button class="btn" data-agregar="${prod.id}">Agregar al carrito</button>
      </div>
    </div>
  </article>`;
}

/* ===== VISTAS ===== */
function mostrarInicio() {
  $('#vista-inicio').hidden = false;
  $('#vista-catalogo').hidden = true;
}
function mostrarCatalogo(cat) {
  const c = CATEGORIAS[cat];
  $('#cat-titulo').textContent = c.t;
  $('#cat-desc').textContent = c.d;
  $('#productos').innerHTML = PRODUCTOS.filter(x => x.cat === cat).map(tarjeta).join('');
  $('#vista-inicio').hidden = true;
  $('#vista-catalogo').hidden = false;
}
function ruta() {
  const h = location.hash.slice(1) || 'inicio';
  if (h === 'buscar' && consulta) mostrarBusqueda(); else if (CATEGORIAS[h]) mostrarCatalogo(h); else mostrarInicio();
  document.querySelectorAll('.menu a').forEach(a =>
    a.classList.toggle('activo', a.getAttribute('href') === '#' + (CATEGORIAS[h] ? h : 'inicio')));
  $('#menu').classList.remove('abierto');
  $('#desplegable').classList.remove('abierto');
  $('#carrito').hidden = true;
  window.scrollTo(0, 0);
}

/* ===== SECCIONES DE INICIO ===== */
function pintarInicio() {
  $('#categorias').innerHTML = Object.entries(CATEGORIAS).map(([k, c]) => {
    const prod = { n: c.t, img: c.img[0], zoom: c.img[1] === '#' ? '380%' : 'cover', pos: c.img[2] || 'center' };
    return `<a class="tarjeta cat-card" href="#${k}">${foto(prod)}<div class="info"><h3>${c.t}</h3><span class="finca">Ver catálogo</span></div></a>`;
  }).join('');
  $('#ofertas').innerHTML = PRODUCTOS.filter(x => x.off >= 12).slice(0, 4).map(tarjeta).join('');
  $('#resenas').innerHTML = RESENAS.map(r =>
    `<article class="resena"><div class="estrellas" aria-label="${r[2]} de 5 estrellas">${estrellas(r[2])}</div><p>${r[3]}</p><strong>${r[0]}</strong> <span class="finca">· ${r[1]}</span></article>`).join('');
}

/* ===== CARRUSEL ===== */
let actual = 0, timer;
function iniciarCarrusel() {
  $('#pistas').innerHTML = SLIDES.map(s =>
    `<div class="slide" style="background-image:url('${IMG}${s[0]}')"><div><h3>${s[1]}</h3><p>${s[2]}</p><a href="#${s[3]}">Ver productos</a></div></div>`).join('');
  $('#puntos').innerHTML = SLIDES.map((_, i) => `<button aria-label="Ir a la imagen ${i + 1}" data-i="${i}"></button>`).join('');
  irA(0);
  $('#prev').onclick = () => irA(actual - 1);
  $('#next').onclick = () => irA(actual + 1);
  $('#puntos').onclick = e => e.target.dataset.i && irA(+e.target.dataset.i);
  const car = $('#carrusel');
  const auto = () => { clearInterval(timer); timer = setInterval(() => irA(actual + 1), 5000); };
  car.onmouseenter = () => clearInterval(timer);
  car.onmouseleave = auto;
  auto();
}
function irA(i) {
  actual = (i + SLIDES.length) % SLIDES.length;
  $('#pistas').style.transform = `translateX(-${actual * 100}%)`;
  document.querySelectorAll('#puntos button').forEach((b, k) => b.classList.toggle('on', k === actual));
}

/* ===== CARRITO ===== */
let carrito = [];
try { carrito = JSON.parse(localStorage.getItem('carrito-tolima')) || []; } catch (e) { carrito = []; }

const guardar = () => { try { localStorage.setItem('carrito-tolima', JSON.stringify(carrito)); } catch (e) {} };
const buscar = id => PRODUCTOS.find(x => x.id === id);

function agregar(id, unidad) {
  const item = carrito.find(c => c.id === id && c.u === unidad);
  if (item) item.q++; else carrito.push({ id, u: unidad, q: 1 });
  pintarCarrito();
  aviso(`${buscar(id).n} agregado al carrito`);
}
function pintarCarrito() {
  guardar();
  const cuerpo = $('#lista-carrito tbody');
  cuerpo.innerHTML = carrito.map((c, i) => {
    const prod = buscar(c.id);
    const pu = precioUnidad(prod, c.u);
    return `<tr>
      <td><div class="mini" style="background-image:url('${IMG}${prod.img}');background-size:${prod.zoom};background-position:${prod.pos}"></div></td>
      <td>${prod.n}<br><small>${peso(pu)} / ${c.u === 'lb' ? 'libra' : 'kilo'}</small></td>
      <td><div class="cant"><button data-menos="${i}" aria-label="Quitar uno">−</button>${c.q}<button data-mas="${i}" aria-label="Agregar uno">+</button></div></td>
      <td>${peso(pu * c.q)}</td>
      <td><button class="quitar" data-quitar="${i}" aria-label="Eliminar ${prod.n}">🗑</button></td></tr>`;
  }).join('');
  const total = carrito.reduce((s, c) => s + precioUnidad(buscar(c.id), c.u) * c.q, 0);
  $('#total').textContent = peso(total);
  $('#contador').textContent = carrito.reduce((s, c) => s + c.q, 0);
  $('#carrito-vacio').hidden = carrito.length > 0;
  $('#lista-carrito').hidden = carrito.length === 0;
}
function aviso(txt) {
  const a = $('#aviso');
  a.textContent = txt;
  a.classList.add('ver');
  setTimeout(() => a.classList.remove('ver'), 2200);
}

/* ===== EVENTOS ===== */
document.addEventListener('click', e => {
  const t = e.target;
  const dentro = t.closest('#carrito');
  if (t.dataset.agregar) agregar(t.dataset.agregar, t.closest('.compra').querySelector('select').value);
  if (t.dataset.mas) { carrito[t.dataset.mas].q++; pintarCarrito(); }
  if (t.dataset.menos) {
    const c = carrito[t.dataset.menos];
    if (--c.q <= 0) carrito.splice(t.dataset.menos, 1);
    pintarCarrito();
  }
  if (t.dataset.quitar) { carrito.splice(t.dataset.quitar, 1); pintarCarrito(); }
  if (t.closest('#btn-carrito')) $('#carrito').hidden = !$('#carrito').hidden;
  else if (!dentro && !t.dataset.agregar) $('#carrito').hidden = true;
});
$('#vaciar-carrito').onclick = () => { carrito = []; pintarCarrito(); };
$('#pagar').onclick = () => {
  if (!carrito.length) return aviso('Tu carrito está vacío');
  carrito = []; pintarCarrito(); $('#carrito').hidden = true;
  aviso('¡Gracias por tu compra! Te contactaremos para coordinar la entrega.');
};
$('#burger').onclick = () => $('#menu').classList.toggle('abierto');
/* ===== MENÚ DESPLEGABLE DE CATEGORÍAS ===== */
function pintarMenu() {
  $('#submenu').innerHTML = Object.entries(CATEGORIAS).map(([k, c]) => `<a href="#${k}">${c.t}</a>`).join('');
}
$('#desp-btn').onclick = () => {
  const d = $('#desplegable');
  d.classList.toggle('abierto');
  $('#desp-btn').setAttribute('aria-expanded', d.classList.contains('abierto'));
};
document.addEventListener('click', e => {
  if (!e.target.closest('#desplegable')) $('#desplegable').classList.remove('abierto');
});

/* ===== BÚSQUEDA ===== */
let consulta = '';
const norm = t => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
function mostrarBusqueda() {
  const q = norm(consulta);
  const r = PRODUCTOS.filter(x => norm(`${x.n} ${x.finca} ${x.mun} ${CATEGORIAS[x.cat].t}`).includes(q));
  $('#cat-titulo').textContent = `Resultados para “${consulta}”`;
  $('#cat-desc').textContent = r.length
    ? `${r.length} producto(s) encontrados.`
    : 'No encontramos productos con esa búsqueda. Prueba con otra palabra, como tomate, fresa o café.';
  $('#productos').innerHTML = r.map(tarjeta).join('');
  $('#vista-inicio').hidden = true;
  $('#vista-catalogo').hidden = false;
}
$('#btn-lupa').onclick = () => {
  const b = $('#buscador');
  b.hidden = !b.hidden;
  if (!b.hidden) $('#q').focus();
};
$('#buscador').onsubmit = e => {
  e.preventDefault();
  consulta = $('#q').value.trim();
  if (!consulta) return;
  if (location.hash === '#buscar') ruta(); else location.hash = '#buscar';
};

/* ===== REGISTRO (CLIENTES Y CAMPESINOS) Y SUSCRIPCIÓN ===== */
const MUNICIPIOS = ['Ibagué','Alvarado','Ataco','Cajamarca','Chaparral','Coyaima','Espinal','Fresno','Guamo','Herveo','Honda','Líbano','Melgar','Natagaima','Ortega','Planadas','Purificación','Rioblanco','Rovira','Mariquita'];
$('#p-mun').innerHTML = '<option value="">Selecciona…</option>' + MUNICIPIOS.map(m => `<option>${m}</option>`).join('');

// Sin servidor: los datos quedan solo en este navegador y la contraseña no se guarda.
function guardarRegistro(clave, datos) {
  let lista = [];
  try { lista = JSON.parse(localStorage.getItem(clave)) || []; } catch (e) {}
  lista.push({ ...datos, fecha: new Date().toISOString() });
  try { localStorage.setItem(clave, JSON.stringify(lista)); } catch (e) {}
}
function saludo(nombre) {
  $('#btn-registro').textContent = nombre ? 'Hola, ' + nombre.split(' ')[0] : 'Registrarse';
}
function cambiarTab(t) {
  document.querySelectorAll('.pestanas button').forEach(b => b.classList.toggle('on', b.dataset.tab === t));
  $('#f-cliente').hidden = t !== 'cliente';
  $('#f-proveedor').hidden = t !== 'proveedor';
}
function abrirModal() { $('#modal').hidden = false; document.body.style.overflow = 'hidden'; }
function cerrarModal() { $('#modal').hidden = true; document.body.style.overflow = ''; }
$('#btn-registro').onclick = abrirModal;
$('#cerrar-modal').onclick = cerrarModal;
$('#modal').onclick = e => { if (e.target.id === 'modal') cerrarModal(); };
document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarModal(); });
document.querySelector('.pestanas').onclick = e => e.target.dataset.tab && cambiarTab(e.target.dataset.tab);

function enviarRegistro(form, clave, mensaje) {
  form.onsubmit = e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    delete d.clave;
    guardarRegistro(clave, d);
    try { localStorage.setItem('sesion-tolima', d.nombre); } catch (err) {}
    saludo(d.nombre);
    form.reset();
    cerrarModal();
    aviso(mensaje);
  };
}
enviarRegistro($('#f-cliente'), 'clientes-tolima', '¡Bienvenido! Tu cuenta de cliente fue creada.');
enviarRegistro($('#f-proveedor'), 'proveedores-tolima', '¡Gracias! Tu finca quedó registrada como proveedora.');
$('#f-sus').onsubmit = e => {
  e.preventDefault();
  guardarRegistro('suscriptores-tolima', Object.fromEntries(new FormData(e.target)));
  e.target.reset();
  aviso('¡Listo! Ya estás suscrito.');
};
try { saludo(localStorage.getItem('sesion-tolima')); } catch (e) {}

window.addEventListener('hashchange', ruta);

pintarMenu();
pintarInicio();
iniciarCarrusel();
pintarCarrito();
ruta();
