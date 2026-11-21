/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset')],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './features/**/*.{ts,tsx}', './screens/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F3F7FF',
        foreground: '#102858',
        muted: '#5C7395',
        border: '#DCE6F7',
        card: '#ffffff',
        siam: {
          blue: {
            DEFAULT: '#0645B5',
            light: '#1559D6',
            dark: '#06358E',
            bright: '#1559D6',
            navy: '#052A70',
            tint: '#EEF4FF',
          },
          yellow: {
            DEFAULT: '#FFD400',
            light: '#FFDF32',
            dark: '#F0BF00',
          },
          gray: {
            DEFAULT: '#5C7395',
            light: '#A5B5CC',
            dark: '#102858',
          },
        },
      },
    },
  },
  plugins: [],
};
