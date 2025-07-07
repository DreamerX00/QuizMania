import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Orbitron', 'sans-serif'],
        body: ['Poppins', 'sans-serif'],
      },
      colors: {
        'primary-accent': 'var(--primary-accent)',
      },
    },
  },
  plugins: [],
};

export default config; 