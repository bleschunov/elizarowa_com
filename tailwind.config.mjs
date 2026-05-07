/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    screens: {
      xs: '400px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        gold: {
          50:  '#fdf8ee',
          100: '#f8eccc',
          200: '#f0d48a',
          300: '#e8bc52',
          400: '#dfa32a',
          500: '#c4873a',
          600: '#a86d2e',
          700: '#8a5523',
          800: '#6e421c',
          900: '#593516',
        },
        beige: {
          50: '#faf8f5',
          100: '#f5f0e8',
          200: '#ede4d3',
          300: '#ddd0b8',
          400: '#c8b596',
          500: '#b39a78',
          600: '#9e8264',
          700: '#846b52',
          800: '#6d5844',
          900: '#59493a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
      });
    },
  ],
};
