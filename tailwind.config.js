/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      // No custom colors needed — all design tokens defined in src/app/globals.css via @theme
      fontFamily: {
        jb: ['var(--font-jb-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
        ibm: ['var(--font-ibm-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      }
    }
  },
  plugins: [],
}