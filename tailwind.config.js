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
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#d6e0ff',
          300: '#b3c7ff',
          400: '#85a3ff',
          500: '#4361ee', // Slate-indigo accent
          600: '#2d44db',
          700: '#2030c2',
          800: '#1d299f',
          900: '#1d267f',
          950: '#12164f',
        },
        sidebar: {
          brand: '#0f172a',
          bg: '#1e293b',
          hover: '#334155',
          active: '#4361ee',
          text: '#94a3b8',
          textActive: '#ffffff',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
