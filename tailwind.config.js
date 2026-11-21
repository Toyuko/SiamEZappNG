/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset')],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './features/**/*.{ts,tsx}', './screens/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#ffffff',
        foreground: '#1f2937',
        muted: '#6b7280',
        border: '#e5e7eb',
        card: '#ffffff',
        siam: {
          blue: {
            DEFAULT: '#2454D8',
            light: '#3979FF',
            dark: '#153DAE',
            bright: '#3979FF',
            navy: '#102B72',
          },
          yellow: {
            DEFAULT: '#FFD329',
            light: '#FFE566',
            dark: '#FFB900',
          },
          gray: {
            DEFAULT: '#374151',
            light: '#68758D',
            dark: '#15213A',
          },
        },
      },
    },
  },
  plugins: [],
};
