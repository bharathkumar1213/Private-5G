/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Shared light workspace palette. Keep data-status colors restrained.
        square: {
          workspace: '#F1F4F7',
          card: '#FFFFFF',
          surface: '#F5F7FA',
          accent: '#F59E0B',
          navy: '#17213B',
          muted: '#8995A8',
          divider: '#E9EDF2',
        },
        looker: {
          bg: '#F1F4F7',
          card: '#FFFFFF',
          sidebar: '#FFFFFF',
          header: '#FFFFFF',
          border: '#E2E8F0',
          borderSubtle: '#EDF2F7',
          text: '#0F172A',
          muted: '#64748B',
          // Rich Multi-Color Data Visualization Tokens
          blue: '#F59E0B',
          sky: '#E98A1C',
          cyan: '#F59E0B',
          teal: '#0D9488',
          emerald: '#059669',
          amber: '#F5A623',
          coral: '#FF6B6B',
          indigo: '#F59E0B',
          rose: '#E11D48',
        },
        // Dark NOC Mode Tokens
        noc: {
          bg: '#0F172A',
          sidebar: '#0B1120',
          card: '#1E293B',
          elevated: '#283548',
          border: '#334155',
          primary: '#F8FAFC',
          secondary: '#94A3B8',
          teal: '#14B8A6',
          amber: '#F59E0B',
          red: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '6px',
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
      },
      boxShadow: {
        'square': '0 12px 30px rgba(30, 54, 87, 0.07), 0 2px 8px rgba(30, 54, 87, 0.03)',
        'square-hover': '0 18px 38px rgba(30, 54, 87, 0.11), 0 4px 12px rgba(30, 54, 87, 0.04)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.07), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
        'panel': '0 2px 8px -1px rgba(0, 0, 0, 0.25)',
      },
    },
  },
  plugins: [],
};
