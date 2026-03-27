/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset')],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './features/**/*.{ts,tsx}'],
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
            DEFAULT: '#2C54C6',
            light: '#3D5FCE',
            dark: '#2344B0',
            bright: '#5B76E0',
          },
          yellow: {
            DEFAULT: '#FFCE2D',
            light: '#FFD84D',
            dark: '#E6B828',
          },
          gray: {
            DEFAULT: '#374151',
            light: '#6b7280',
            dark: '#1f2937',
          },
        },
      },
    },
  },
  plugins: [],
};
