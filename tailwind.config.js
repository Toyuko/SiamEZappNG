/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset')],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './features/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#f9fafb',
          text: '#0f172a',
          muted: '#64748b',
        },
        brand: {
          50: '#eef7ff',
          100: '#d9ecff',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#2563eb',
          600: '#1E40AF',
          700: '#1B3A8A',
        },
      },
    },
  },
  plugins: [],
};
