/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset')],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './features/**/*.{ts,tsx}', './screens/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F3F7FF',
        foreground: '#102A5E',
        muted: '#60789C',
        border: '#DCE6F8',
        card: '#ffffff',
        siam: {
          blue: {
            DEFAULT: '#0647C7',
            light: '#1457D9',
            dark: '#06358E',
            bright: '#1457D9',
            navy: '#062B78',
            tint: '#EEF4FF',
          },
          yellow: {
            DEFAULT: '#FFD500',
            light: '#FFDF32',
            dark: '#F0BF00',
          },
          gray: {
            DEFAULT: '#60789C',
            light: '#A5B5CC',
            dark: '#102A5E',
          },
        },
      },
    },
  },
  plugins: [],
};
