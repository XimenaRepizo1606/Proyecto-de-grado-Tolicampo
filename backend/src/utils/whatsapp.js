// Arma el enlace "click to chat" de WhatsApp (RF08). El número se guarda sin indicativo (10 dígitos).
const enlaceWhatsApp = (telefono, texto) =>
  telefono ? `https://wa.me/57${telefono}?text=${encodeURIComponent(texto)}` : null;

const pesos = (n) => '$' + Math.round(n).toLocaleString('es-CO');

module.exports = { enlaceWhatsApp, pesos };
