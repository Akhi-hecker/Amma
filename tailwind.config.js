/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#C9A14A",
        "primary-dark": "#b08d3f",
        "background-light": "#F9F7F3",
        "background-dark": "#282624",
        "text-main": "#1C1C1C",
        "text-muted": "#5A5751",
        "divider": "#E8E6E0",
      },
      fontFamily: {
        "sans": ["Inter", "sans-serif"],
        "serif": ["Playfair Display", "serif"],
        "script": ["var(--font-great-vibes)", "cursive"],
      },
      boxShadow: {
        'soft': '0 20px 40px -10px rgba(201, 161, 74, 0.15)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "0.75rem",
        "xl": "1rem",
        "2xl": "1.5rem",
      },
      animation: {
        "scroll": "scroll 40s linear infinite",
      },
      keyframes: {
        scroll: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
}
