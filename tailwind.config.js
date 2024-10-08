/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

export default {
  content: ['./src/**/*.{vue,js,ts,jsx,tsx}', './index.html'],
  plugins: [require('tailwindcss-primeui')],
  theme: {
    extend: {
      colors: {
        error: colors.red,
        success: colors.emerald,
        warning: colors.amber,
        hm: 'var(--hm-color)'
      }
    }
  }
}
