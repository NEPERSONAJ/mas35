/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff9eb',
          100: '#fef2d6',
          200: '#fce4ac',
          300: '#fbd478',
          400: '#f9b840',
          500: '#f79815',
          600: '#db710d',
          700: '#b6510f',
          800: '#934013',
          900: '#793514',
          950: '#441a09',
        }
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
        montserrat: ['Montserrat', 'system-ui', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 10px theme("colors.primary.500")' },
          '100%': { boxShadow: '0 0 20px theme("colors.primary.500")' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
};