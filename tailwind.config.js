const autoprefixer = require('autoprefixer');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js}", "./dist/js/app.js"],
  theme: {
    extend: {},
  },
  plugins: [
    autoprefixer,
  ],
}

