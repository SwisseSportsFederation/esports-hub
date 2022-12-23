/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        red: {
          '1': '#FF4040',
        },

        gray: {
          '1': '#121212',
          '2': '#252525',
          '3': '#424242',
          '4': '#9A9A9A',
          '5': '#C4C4C4',
          '6': '#E0E0E0',
          '7': '#F2F2F2',
        },
      },
      boxShadow: {
        top: '0 -10px 15px -3px rgba(0, 0, 0, 0.08), 0 -4px 6px -2px rgba(0, 0, 0, 0.04)',
      },
    }
  },
  plugins: [],
}
