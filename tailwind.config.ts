
import type {Config} from 'tailwindcss';

const colorSafelist = [
  'yellow', 'blue', 'purple', 'cyan', 'orange', 'pink', 'green', 'indigo', 'red', 'teal', 'gray', 'slate'
].flatMap((color) => [
  `text-${color}-600`, `dark:text-${color}-500`,
  `bg-${color}-100`, `dark:bg-${color}-900/50`,
  `var(--${color}-500)`, `var(--${color}-600)`,
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
        sans: ["var(--font-inter)", "sans-serif"],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        // Adding HSL vars for category colors
        yellow: { 500: 'var(--yellow-500)', 600: 'var(--yellow-600)' },
        blue: { 500: 'var(--blue-500)', 600: 'var(--blue-600)' },
        purple: { 500: 'var(--purple-500)', 600: 'var(--purple-600)' },
        cyan: { 500: 'var(--cyan-500)', 600: 'var(--cyan-600)' },
        orange: { 500: 'var(--orange-500)', 600: 'var(--orange-600)' },
        pink: { 500: 'var(--pink-500)', 600: 'var(--pink-600)' },
        green: { 500: 'var(--green-500)', 600: 'var(--green-600)' },
        indigo: { 500: 'var(--indigo-500)', 600: 'var(--indigo-600)' },
        red: { 500: 'var(--red-500)', 600: 'var(--red-600)' },
        teal: { 500: 'var(--teal-500)', 600: 'var(--teal-600)' },
        gray: { 500: 'var(--gray-500)', 600: 'var(--gray-600)' },
        slate: { 500: 'var(--slate-500)', 600: 'var(--slate-600)' },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
