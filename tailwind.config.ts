import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: '#060816',
        card: '#111827',
        accent: '#60a5fa',
      },
    },
  },
  plugins: [],
}

export default config
