// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,vue,html}'],
  theme: {
    extend: {
      colors: {
        neonCyan: '#00f0ff',
        neonMagenta: '#ff007f',
        cyberPurple: '#7e00ff',
        cyberGreen: '#39ff14'
      },
    },
  },
  plugins: [],
};
