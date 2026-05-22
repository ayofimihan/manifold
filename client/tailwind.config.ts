import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'Menlo', 'monospace'],
      },
      colors: {
        bg: {
          base: '#050607',
          surface: '#0A0C0E',
          raised: '#0F1214',
          hover: '#15191C',
          inset: '#06080A',
        },
        border: {
          subtle: '#1A1F23',
          muted: '#252B30',
          strong: '#363D43',
        },
        text: {
          primary: '#E5E9EC',
          secondary: '#9BA3AA',
          tertiary: '#5C6469',
          muted: '#3D4348',
        },
        accent: {
          DEFAULT: '#2DD4BF',
          hover: '#5EEAD4',
          dim: '#0F766E',
          glow: 'rgba(45, 212, 191, 0.15)',
        },
        success: {
          DEFAULT: '#22C55E',
          dim: '#15803D',
          bg: 'rgba(34, 197, 94, 0.10)',
        },
        danger: {
          DEFAULT: '#EF4444',
          dim: '#991B1B',
          bg: 'rgba(239, 68, 68, 0.10)',
        },
        warn: {
          DEFAULT: '#F59E0B',
          dim: '#B45309',
          bg: 'rgba(245, 158, 11, 0.10)',
        },
        info: {
          DEFAULT: '#3B82F6',
          dim: '#1D4ED8',
        },
      },
      borderRadius: {
        none: '0',
        sm: '2px',
        DEFAULT: '3px',
        md: '4px',
        lg: '6px',
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px', letterSpacing: '0.04em' }],
        xs: ['11px', { lineHeight: '16px', letterSpacing: '0.02em' }],
        sm: ['12px', { lineHeight: '18px' }],
        base: ['13px', { lineHeight: '20px' }],
        md: ['14px', { lineHeight: '22px' }],
        lg: ['16px', { lineHeight: '24px' }],
        xl: ['20px', { lineHeight: '28px' }],
        '2xl': ['26px', { lineHeight: '32px' }],
        '3xl': ['34px', { lineHeight: '40px' }],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(45, 212, 191, 0.25), 0 0 24px -8px rgba(45, 212, 191, 0.35)',
        hairline: 'inset 0 0 0 1px #1A1F23',
      },
      backgroundImage: {
        grid: 'linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px)',
      },
      keyframes: {
        pulse: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.55' } },
        ticker: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        flash: {
          '0%': { backgroundColor: 'rgba(45,212,191,0.18)' },
          '100%': { backgroundColor: 'transparent' },
        },
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideIn: { from: { transform: 'translateX(8px)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
      },
      animation: {
        pulse: 'pulse 2s ease-in-out infinite',
        ticker: 'ticker 90s linear infinite',
        flash: 'flash 1s ease-out',
        fadeIn: 'fadeIn 200ms ease-out',
        slideIn: 'slideIn 220ms ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config;
