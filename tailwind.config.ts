import type {Config} from 'tailwindcss';

import animate from 'tailwindcss-animate';

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
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))', // Kept as HSL
          foreground: 'hsl(var(--success-foreground))', // Kept as HSL
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        
        // Custom Gray Palette (OKLCH)
        gray: {
          '50': 'var(--color-gray-50)',
          '100': 'var(--color-gray-100)',
          '200': 'var(--color-gray-200)',
          '300': 'var(--color-gray-300)',
          '400': 'var(--color-gray-400)',
          '500': 'var(--color-gray-500)',
          '600': 'var(--color-gray-600)',
          '700': 'var(--color-gray-700)',
          '800': 'var(--color-gray-800)',
          '900': 'var(--color-gray-900)',
          '950': 'var(--color-gray-950)',
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
        indigo: { '100': 'hsl(var(--indigo-100))', '500': 'hsl(var(--indigo-500))', '600': 'hsl(var(--indigo-600))', '900': 'hsl(var(--indigo-900))' },
        red: { '100': 'hsl(var(--red-100))', '500': 'hsl(var(--red-500))', '600': 'hsl(var(--red-600))', '900': 'hsl(var(--red-900))' },
        teal: {
          '100': 'hsl(var(--teal-100))',
          '500': 'hsl(var(--teal-500))',
          '600': 'hsl(var(--teal-600))',
          '900': 'hsl(var(--teal-900))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
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
    },
  },
  plugins: [animate],
} satisfies Config;
