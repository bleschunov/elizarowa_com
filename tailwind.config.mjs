/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
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
  plugins: [],
};
