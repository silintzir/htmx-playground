/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/views/**/*.pug'],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
  daisyui: {
    themes: ['light'],
  },
};
