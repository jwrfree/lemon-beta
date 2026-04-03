import type {Config} from 'tailwindcss';

import animate from 'tailwindcss-animate';
import typography from '@tailwindcss/typography';

const colorSafelist = [
  'yellow', 'blue', 'purple', 'cyan', 'orange', 'pink', 'green', 'indigo', 'red', 'teal', 'rose', 'fuchsia', 'violet'
].flatMap((color) => [
  `text-${color}-600`, `dark:text-${color}-500`,
  `text-${color}-500`, `dark:text-${color}-400`,
  `bg-${color}-100`, `dark:bg-${color}-900/50`,
]);


export default {
  darkMode: ['class'],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    ...colorSafelist,
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        error: {
          DEFAULT: 'var(--error)',
          foreground: 'var(--error-foreground)',
          surface: 'var(--error-surface)',
          muted: 'var(--error-muted)',
          border: 'var(--error-border)',
        },
        success: {
          DEFAULT: 'var(--success)',
          foreground: 'var(--success-foreground)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          foreground: 'var(--warning-foreground)',
        },
        info: {
          DEFAULT: 'var(--info)',
          foreground: 'var(--info-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        'focus-ring': 'var(--focus-ring)',
        'state-hover': 'var(--state-hover)',
        'state-active': 'var(--state-active)',
        
        // Custom Gray Palette (HSL)
        gray: {
          '50': 'hsl(var(--gray-50))',
          '100': 'hsl(var(--gray-100))',
          '200': 'hsl(var(--gray-200))',
          '300': 'hsl(var(--gray-300))',
          '400': 'hsl(var(--gray-400))',
          '500': 'hsl(var(--gray-500))',
          '600': 'hsl(var(--gray-600))',
          '700': 'hsl(var(--gray-700))',
          '800': 'hsl(var(--gray-800))',
          '900': 'hsl(var(--gray-900))',
          '950': 'hsl(var(--gray-950))',
        },

        chart: {
          '1': 'var(--chart-1)',
          '2': 'var(--chart-2)',
          '3': 'var(--chart-3)',
          '4': 'var(--chart-4)',
          '5': 'var(--chart-5)',
        },
        // Adding HSL vars for category colors to be accessible by JS
        yellow: { '100': 'hsl(var(--yellow-100))', '500': 'hsl(var(--yellow-500))', '600': 'hsl(var(--yellow-600))', '900': 'hsl(var(--yellow-900))' },
        blue: { '100': 'hsl(var(--blue-100))', '500': 'hsl(var(--blue-500))', '600': 'hsl(var(--blue-600))', '900': 'hsl(var(--blue-900))' },
        purple: { '100': 'hsl(var(--purple-100))', '500': 'hsl(var(--purple-500))', '600': 'hsl(var(--purple-600))', '900': 'hsl(var(--purple-900))' },
        cyan: { '100': 'hsl(var(--cyan-100))', '500': 'hsl(var(--cyan-500))', '600': 'hsl(var(--cyan-600))', '900': 'hsl(var(--cyan-900))' },
        orange: { '100': 'hsl(var(--orange-100))', '500': 'hsl(var(--orange-500))', '600': 'hsl(var(--orange-600))', '900': 'hsl(var(--orange-900))' },
        pink: { '100': 'hsl(var(--pink-100))', '500': 'hsl(var(--pink-500))', '600': 'hsl(var(--pink-600))', '900': 'hsl(var(--pink-900))' },
        rose: { '100': 'hsl(var(--rose-100))', '500': 'hsl(var(--rose-500))', '600': 'hsl(var(--rose-600))', '900': 'hsl(var(--rose-900))' },
        fuchsia: { '100': 'hsl(var(--fuchsia-100))', '500': 'hsl(var(--fuchsia-500))', '600': 'hsl(var(--fuchsia-600))', '900': 'hsl(var(--fuchsia-900))' },
        violet: { '100': 'hsl(var(--violet-100))', '500': 'hsl(var(--violet-500))', '600': 'hsl(var(--violet-600))', '900': 'hsl(var(--violet-900))' },
        green: { '100': 'hsl(var(--green-100))', '500': 'hsl(var(--green-500))', '600': 'hsl(var(--green-600))', '900': 'hsl(var(--green-900))' },
        emerald: { '100': 'hsl(var(--emerald-100))', '500': 'hsl(var(--emerald-500))', '600': 'hsl(var(--emerald-600))', '900': 'hsl(var(--emerald-900))' },
        indigo: { '100': 'hsl(var(--indigo-100))', '500': 'hsl(var(--indigo-500))', '600': 'hsl(var(--indigo-600))', '900': 'hsl(var(--indigo-900))' },
        red: { '100': 'hsl(var(--red-100))', '500': 'hsl(var(--red-500))', '600': 'hsl(var(--red-600))', '900': 'hsl(var(--red-900))' },
        teal: {
          '50': 'hsl(var(--teal-50))',
          '100': 'hsl(var(--teal-100))',
          '200': 'hsl(var(--teal-200))',
          '300': 'hsl(var(--teal-300))',
          '400': 'hsl(var(--teal-400))',
          '500': 'hsl(var(--teal-500))',
          '600': 'hsl(var(--teal-600))',
          '700': 'hsl(var(--teal-700))',
          '800': 'hsl(var(--teal-800))',
          '900': 'hsl(var(--teal-900))',
          '950': 'hsl(var(--teal-950))',
        },
        volt: {
          '50': 'hsl(var(--volt-50))',
          '100': 'hsl(var(--volt-100))',
          '200': 'hsl(var(--volt-200))',
          '300': 'hsl(var(--volt-300))',
          '400': 'hsl(var(--volt-400))',
          '500': 'hsl(var(--volt-500))',
          '600': 'hsl(var(--volt-600))',
          '700': 'hsl(var(--volt-700))',
          '800': 'hsl(var(--volt-800))',
          '900': 'hsl(var(--volt-900))',
        },
        'dark-gray': 'hsl(var(--gray-900))',
      },
      borderRadius: {
      borderRadius: {
        none: '0',
        DEFAULT: 'var(--radius)',
        inherit: 'inherit',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
        '4xl': '32px',
        full: '9999px',
        'card': 'var(--radius-card)',
        'card-premium': 'var(--radius-card-premium)',
        'card-glass': 'var(--radius-card-glass)',
        'card-icon': 'var(--radius-card-icon)',
        squircle: '38%',
      },
      fontSize: {
        'display-lg': ['2rem', { lineHeight: '2.5rem', fontWeight: '700' }],
        'display-md': ['1.5rem', { lineHeight: '2rem', fontWeight: '700' }],
        'display-sm': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],
        'title-lg': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '600' }],
        'title-md': ['1rem', { lineHeight: '1.5rem', fontWeight: '600' }],
        'title-sm': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '600' }],
        'body-lg': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
        'body-md': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
        'body-sm': ['0.75rem', { lineHeight: '1rem', fontWeight: '400' }],
        'label-lg': ['0.875rem', { lineHeight: '1rem', fontWeight: '500' }],
        'label-md': ['0.75rem', { lineHeight: '1rem', fontWeight: '500' }],
        'label-sm': ['0.625rem', { lineHeight: '0.875rem', fontWeight: '500' }],
        // Backward-compatible alias for existing DS-1 classes.
        'label': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em', fontWeight: '600' }],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'toast-enter': {
          '0%': { transform: 'translateY(100%) scaleX(0.2)', opacity: '0' },
          '50%': { transform: 'translateY(0) scaleX(0.2)', opacity: '1' },
          '100%': { transform: 'translateY(0) scaleX(1)', opacity: '1' },
        },
        'toast-exit': {
          '0%': { transform: 'translateY(0) scaleX(1)', opacity: '1' },
          '50%': { transform: 'translateY(0) scaleX(0.2)', opacity: '1' },
          '100%': { transform: 'translateY(100%) scaleX(0.2)', opacity: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'toast-enter': 'toast-enter 0.4s ease-out',
        'toast-exit': 'toast-exit 0.4s ease-in',
      },
      boxShadow: {
      boxShadow: {
        'elevation-1': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'elevation-2': '0 2px 8px 0 rgb(0 0 0 / 0.08)',
        'elevation-3': '0 4px 16px 0 rgb(0 0 0 / 0.12)',
        'elevation-4': '0 8px 32px 0 rgb(0 0 0 / 0.16)',
        // elevation-1: subtle card separation
        // elevation-2: cards, list items
        // elevation-3: sheets, drawers, popovers
        // elevation-4: modals, dialogs
        card: '0 2px 8px 0 rgb(0 0 0 / 0.08)',
        lg: '0 4px 16px 0 rgb(0 0 0 / 0.12)',
        xl: '0 8px 32px 0 rgb(0 0 0 / 0.16)',
        'soft': '0 2px 8px 0 rgb(0 0 0 / 0.08)',
        'premium': '0 4px 16px 0 rgb(0 0 0 / 0.12)',
        'button': '0 2px 8px 0 rgb(0 0 0 / 0.08)',
      },
    },
  },
  plugins: [animate, typography],
} satisfies Config;

