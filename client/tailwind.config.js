/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef3ef',
          100: '#d7e1d8',
          200: '#b3c7b6',
          300: '#8ba791',
          400: '#67896e',
          500: '#4e6d55',
          600: '#3d5a45',
          700: '#324a3a',
          800: '#2b3e31',
          900: '#24342a',
          950: '#131d17',
        },
        cream: '#FDFBF7',
        accent: {
          DEFAULT: '#E07A5F',
          light: '#e6937d',
          dark: '#c45e43',
        },
        emergency: {
          DEFAULT: '#D90429',
          light: '#ed2c4d',
          dark: '#b50322',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        wave: 'wave 2.5s infinite',
        fadeIn: 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        wave: {
          '0%': { transform: 'rotate(0.0deg)' },
          '10%': { transform: 'rotate(14.0deg)' },
          '20%': { transform: 'rotate(-8.0deg)' },
          '30%': { transform: 'rotate(14.0deg)' },
          '40%': { transform: 'rotate(-4.0deg)' },
          '50%': { transform: 'rotate(10.0deg)' },
          '60%': { transform: 'rotate(0.0deg)' },
          '100%': { transform: 'rotate(0.0deg)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
