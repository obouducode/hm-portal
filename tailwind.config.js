/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './node_modules/@locokit/vue-components/dist/lib.js'
    // '../../../locokit-next/packages/vue-components/**/*.js',
  ],
  plugins: [require('tailwindcss-primeui')],
  theme: {
    extend: {
      backgroundImage: {
        'hero-pattern': "url('/assets/background_1600x1600.jpg')"
      }
      // colors: {
      //   error: colors.red,
      //   success: colors.emerald,
      //   warning: colors.amber,
      //   hm: 'var(--hm-color)'
      // }
    }
  },
  safelist: [
    {
      pattern: /bg-slate-(100|200|300|400|500|600|700|800|900)/
    },
    {
      pattern: /bg-(primary|secondary)-(100|200|300|400|500|600|700|800|900)/
    }
  ]
}
