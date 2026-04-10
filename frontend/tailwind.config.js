/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'design': '#6B7280',
        'validation': '#3B82F6',
        'approval': '#F97316',
        'completed': '#10B981'
      }
    },
  },
  plugins: [],
}
