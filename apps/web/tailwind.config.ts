import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: 'var(--background)',
        surface: 'var(--surface)',
        'surface-hover': 'var(--surface-hover)',
        border: 'var(--border)',
        foreground: 'var(--foreground)',
        muted: 'var(--muted)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        status: {
          good: 'var(--status-good)',
          info: 'var(--status-info)',
          warning: 'var(--status-warning)',
          serious: 'var(--status-serious)',
          critical: 'var(--status-critical)',
        },
        module: {
          'document-ai': 'var(--module-document-ai)',
          'corporate-fraud': 'var(--module-corporate-fraud)',
          'payment-risk': 'var(--module-payment-risk)',
          'supplier-intelligence': 'var(--module-supplier-intelligence)',
          investigation: 'var(--module-investigation)',
          'executive-dashboard': 'var(--module-executive-dashboard)',
          'rules-engine': 'var(--module-rules-engine)',
        },
      },
      borderRadius: {
        lg: '1rem',
        md: '0.75rem',
        sm: '0.5rem',
      },
      boxShadow: {
        glow: '0 0 24px -6px var(--tw-shadow-color)',
      },
    },
  },
  plugins: [],
} satisfies Config;
