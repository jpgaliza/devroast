/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{ts,tsx,js,jsx}",
    "./src/app/**/*.{ts,tsx,js,jsx}",
    "./app/**/*.{ts,tsx,js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Core palette derived from Pencil design
        background: '#F2F3F0',
        foreground: '#111111',
        'accent-green': '#10B981',
        'accent-red': '#EF4444',
        accent: '#F2F3F0',
        primary: '#FF8400',
        secondary: '#E7E8E5',
        destructive: '#D93C15',
        muted: '#F2F3F0',
        'border': '#CBCCC9',
        'bg-elevated': '#1A1A1A',
        'bg-surface': '#171717',
        'bg-page': '#0C0C0C',
        'ring': '#666666',
        'card': '#FFFFFF',
        'card-foreground': '#111111',
        'popover': '#FFFFFF',
        'popover-foreground': '#111111',
        'secondary-foreground': '#111111',
        'text-muted': '#525252',
        'text-primary': '#E5E5E5',
        'text-secondary': '#A3A3A3',
        'text-tertiary': '#737373',
      },
      fontFamily: {
        jb: ['var(--font-jb-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
        ibm: ['var(--font-ibm-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      }
    }
  },
  plugins: [],
}