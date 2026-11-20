/** Colores y tipografías tomados del prototipo HTML de ToliCampo (style.css) */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'verde-osc': '#14472a',
        'verde-med': '#2e7d3f',
        'verde-cla': '#82a74e',
        'verde-fondo': '#c2d99e',
        naranja: '#f26a1b',
        'naranja-osc': '#c94f0a',
        texto: '#17261b',
        suave: '#5a6a5d',
      },
      fontFamily: {
        sans: ['Barlow', 'Arial', 'sans-serif'],
        titulo: ['"Barlow Condensed"', 'Barlow', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
