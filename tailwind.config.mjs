/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        'bg-secondary': 'rgb(var(--color-bg-secondary) / <alpha-value>)',
        text: 'rgb(var(--color-text) / <alpha-value>)',
        'text-secondary': 'rgb(var(--color-text-secondary) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        'border-strong': 'rgb(var(--color-border-strong) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter Variable', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
      },
      typography: {
        DEFAULT: {
          css: {
            // Text is held to a 68ch measure in global.css; demos, tables and code
            // blocks can use the full column
            maxWidth: 'none',
            color: 'rgb(var(--color-text))',
            fontSize: '1rem',
            lineHeight: '1.7',
            'h1, h2, h3, h4': {
              color: 'rgb(var(--color-text))',
              fontWeight: '600',
              letterSpacing: '-0.02em',
              lineHeight: '1.3',
              scrollMarginTop: '4.5rem',
            },
            h1: { fontSize: '1.5rem', marginTop: '1.5em', marginBottom: '0.5em' },
            h2: { fontSize: '1.25rem', marginTop: '1.5em', marginBottom: '0.5em' },
            h3: { fontSize: '1.1rem', marginTop: '1.25em', marginBottom: '0.4em' },
            p: { marginTop: '1em', marginBottom: '1em' },
            strong: { color: 'rgb(var(--color-text))', fontWeight: '600' },
            a: {
              color: 'rgb(var(--color-text))',
              textDecoration: 'underline',
              textDecorationColor: 'rgb(var(--color-border))',
              textUnderlineOffset: '3px',
              textDecorationThickness: '1px',
              transition: 'text-decoration-color 0.15s',
              '&:hover': {
                textDecorationColor: 'rgb(var(--color-text))',
              },
            },
            blockquote: {
              color: 'rgb(var(--color-text-secondary))',
              borderLeftColor: 'rgb(var(--color-border))',
              borderLeftWidth: '2px',
              fontStyle: 'normal',
              paddingLeft: '1.25rem',
            },
            // Blockquotes are used for notes, not quotations
            'blockquote p:first-of-type::before': { content: 'none' },
            'blockquote p:last-of-type::after': { content: 'none' },
            hr: {
              borderColor: 'rgb(var(--color-border))',
              marginTop: '2em',
              marginBottom: '2em',
            },
            'ol > li::marker': { color: 'rgb(var(--color-text-secondary))' },
            'ul > li::marker': { color: 'rgb(var(--color-text-secondary))' },
            li: { marginTop: '0.25em', marginBottom: '0.25em' },
            'thead th': {
              color: 'rgb(var(--color-text))',
              fontWeight: '600',
              borderBottomColor: 'rgb(var(--color-border))',
            },
            'tbody td': {
              borderBottomColor: 'rgb(var(--color-border))',
            },
            code: {
              color: 'rgb(var(--color-text))',
              backgroundColor: 'rgb(var(--color-bg-secondary))',
              border: '1px solid rgb(var(--color-border))',
              padding: '0.15rem 0.35rem',
              borderRadius: '4px',
              fontWeight: '400',
              fontSize: '0.875em',
            },
            'code::before': { content: '""' },
            'code::after': { content: '""' },
            img: { borderRadius: '8px' },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
