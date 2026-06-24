import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          dark:    '#1D4ED8',
          light:   '#DBEAFE',
          xlight:  '#EFF6FF',
          50: '#EFF6FF', 100: '#DBEAFE', 200: '#BFDBFE',
          300: '#93C5FD', 400: '#60A5FA', 500: '#3B82F6',
          600: '#2563EB', 700: '#1D4ED8', 800: '#1E40AF', 900: '#1E3A8A',
        },
        sidebar: {
          DEFAULT: '#0F172A',
          hover:   '#1E293B',
          active:  '#2563EB',
          border:  '#1E293B',
          text:    '#94A3B8',
          'text-active': '#FFFFFF',
          'text-hover':  '#CBD5E1',
        },
        background: {
          DEFAULT:   '#F8FAFC',
          surface:   '#FFFFFF',
          secondary: '#F1F5F9',
        },
        content: {
          primary:   '#0F172A',
          secondary: '#475569',
          muted:     '#94A3B8',
          disabled:  '#CBD5E1',
          inverse:   '#FFFFFF',
        },
        border: {
          DEFAULT: '#E2E8F0',
          strong:  '#CBD5E1',
          focus:   '#2563EB',
        },
        success: { DEFAULT: '#10B981', light: '#D1FAE5', dark: '#065F46', border: '#6EE7B7' },
        warning: { DEFAULT: '#F59E0B', light: '#FEF3C7', dark: '#92400E', border: '#FCD34D' },
        danger:  { DEFAULT: '#EF4444', light: '#FEE2E2', dark: '#991B1B', border: '#FCA5A5' },
        info:    { DEFAULT: '#3B82F6', light: '#EFF6FF', dark: '#1D4ED8', border: '#93C5FD' },
        purple:  { DEFAULT: '#8B5CF6', light: '#F3E8FF', dark: '#6B21A8', border: '#C4B5FD' },
        status: {
          scheduled: { bg: '#EFF6FF',  text: '#1D4ED8', border: '#2563EB' },
          confirmed:  { bg: '#D1FAE5',  text: '#065F46', border: '#10B981' },
          checkin:    { bg: '#FEF3C7',  text: '#92400E', border: '#F59E0B' },
          inservice:  { bg: '#F3E8FF',  text: '#6B21A8', border: '#8B5CF6' },
          awaiting:   { bg: '#FEE2E2',  text: '#991B1B', border: '#EF4444' },
          completed:  { bg: '#D1FAE5',  text: '#065F46', border: '#10B981' },
          noshow:     { bg: '#F1F5F9',  text: '#475569', border: '#94A3B8' },
          cancelled:  { bg: '#FEE2E2',  text: '#991B1B', border: '#EF4444' },
        },
        payment: {
          pix: '#10B981', cash: '#64748B', debit: '#2563EB',
          credit: '#8B5CF6', voucher: '#F59E0B', transfer: '#3B82F6',
        },
      },
      fontFamily: {
        sans: ['SF Pro Text', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['SF Mono', 'JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'display': ['32px', { lineHeight: '1.2', fontWeight: '700', letterSpacing: '-0.02em' }],
        'h1':      ['24px', { lineHeight: '1.3', fontWeight: '600', letterSpacing: '-0.01em' }],
        'h2':      ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        'h3':      ['16px', { lineHeight: '1.4', fontWeight: '500' }],
        'body':    ['14px', { lineHeight: '1.6' }],
        'small':   ['12px', { lineHeight: '1.5' }],
        'caption': ['11px', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0.06em' }],
        'kpi':     ['28px', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.02em' }],
      },
      borderRadius: {
        'sm': '4px', 'md': '6px', 'lg': '8px', 'xl': '12px', '2xl': '16px',
      },
      boxShadow: {
        'card':     '0 1px 3px 0 rgb(0 0 0 / 0.04)',
        'dropdown': '0 4px 6px -1px rgb(0 0 0 / 0.08)',
        'modal':    '0 20px 25px -5px rgb(0 0 0 / 0.08)',
        'focus':    '0 0 0 3px #DBEAFE',
      },
      width: {
        sidebar: '240px',
        'sidebar-collapsed': '64px',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 150ms ease-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
  ],
}

export default config
