import type {Config} from 'tailwindcss';

const colorSafelist = [
  'yellow', 'blue', 'purple', 'cyan', 'orange', 'pink', 'green', 'indigo', 'red', 'teal', 'stone'
].flatMap((color) => [
  `text-${color}-600`, `dark:text-${color}-500`,
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
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
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
        // Adding HSL vars for category colors to be accessible by JS
        yellow: { '500': 'hsl(var(--yellow-500))', '600': 'hsl(var(--yellow-600))' },
        blue: { '500': 'hsl(var(--blue-500))', '600': 'hsl(var(--blue-600))' },
        purple: { '500': 'hsl(var(--purple-500))', '600': 'hsl(var(--purple-600))' },
        cyan: { '500': 'hsl(var(--cyan-500))', '600': 'hsl(var(--cyan-600))' },
        orange: { '500': 'hsl(var(--orange-500))', '600': 'hsl(var(--orange-600))' },
        pink: { '500': 'hsl(var(--pink-500))', '600': 'hsl(var(--pink-600))' },
        green: { '500': 'hsl(var(--green-500))', '600': 'hsl(var(--green-600))' },
        indigo: { '500': 'hsl(var(--indigo-500))', '600': 'hsl(var(--indigo-600))' },
        red: { '500': 'hsl(var(--red-500))', '600': 'hsl(var(--red-600))' },
        teal: { '500': 'hsl(var(--teal-500))', '600': 'hsl(var(--teal-600))' },
        stone: { '500': 'hsl(var(--stone-500))', '600': 'hsl(var(--stone-600))' },
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
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
