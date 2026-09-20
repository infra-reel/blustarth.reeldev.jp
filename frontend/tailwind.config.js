/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        site: '#0A0A0F',   // 旧: base（text-baseがTailwindのfont-sizeと衝突するため改名）
        navy: '#1A1A2E',
        cyan: '#00D4FF',
        red: '#FF2D55',
        gray: { light: '#E8E8E8', mid: '#6B7280' },
      },
      fontFamily: {
        heading: ['Rajdhani', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
