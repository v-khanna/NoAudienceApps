/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './apps/*/src/**/*.{html,js,svelte,ts}',
    './packages/*/src/**/*.{html,js,svelte,ts}'
  ],
  theme: {
    extend: {
      colors: {
        page: '#14181C',
        surface: '#1B2028',
        elevated: '#2C3440',
        sidebar: '#0F1318',
        modal: '#1E2229',
        accent: {
          green: '#00E054',
          orange: '#FF8000',
          blue: '#40BCF4'
        },
        text: {
          primary: '#FFFFFF',
          body: '#E0E0E0',
          secondary: '#99AABB',
          muted: '#535353'
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.06)',
          hover: 'rgba(255, 255, 255, 0.12)'
        }
      },
      fontFamily: {
        headline: ['Newsreader', 'Georgia', 'Charter', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'Charter', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      fontSize: {
        'page-title': ['28px', { lineHeight: '1.2', fontWeight: '700' }],
        'section-header': ['22px', { lineHeight: '1.3', fontWeight: '600' }],
        'card-title': ['14px', { lineHeight: '1.3', fontWeight: '600' }],
        'body': ['15px', { lineHeight: '1.6', fontWeight: '400' }],
        'metadata': ['12px', { lineHeight: '1.4', fontWeight: '500' }],
        'small-label': ['11px', { lineHeight: '1.3', fontWeight: '500' }]
      },
      borderRadius: {
        'card': '6px',
        'modal': '16px',
        'pill': '999px',
        'chip': '4px'
      },
      boxShadow: {
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.6)',
        'modal': '0 24px 48px rgba(0, 0, 0, 0.5)'
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)'
      },
      letterSpacing: {
        'dark': '0.01em'
      }
    }
  },
  plugins: []
};
