/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'banking-navy': '#1e3a8a',
        'banking-slate': '#64748b',
        'banking-emerald': '#059669',
        'banking-amber': '#d97706',
        'banking-red': '#dc2626',
      }
    },
  },
  plugins: [],
}
