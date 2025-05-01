/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{html,ts,scss}'],
  theme: {
    extend: {
      colors: {
        primary: '#2161E0',
        secondary: '#101044',
        accent: '#FE4E3E',
        highlight: '#FFA114',
        success: '#0E8160',
      },
      fontFamily: {
        heading: ['Montserrat', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
  important: true,
};
