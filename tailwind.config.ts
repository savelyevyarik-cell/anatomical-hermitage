import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FCFBF7', // белый — основной фон
        linen: '#F2ECE1', // бежевый — поверхности, чередующиеся секции
        sand: '#E3D8C6', // бежевый тёмный — разделители, рамки витрин
        navy: '#13294B', // глубокий синий — текст и «тёмные залы»
        slate: '#4C637C', // вторичный текст, подписи
        azure: '#2E6BAA', // акцент: ссылки, этикетки, активные состояния
        sky: '#8CC0E4', // голубой — свечение рентгена, декоративные линии
        mist: '#DCEAF4', // светло-голубой фон
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        grotesk: ['var(--font-grotesk)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
        quote: ['var(--font-quote)', 'Georgia', 'serif'],
      },
      fontSize: {
        // Модульная шкала 1.25 / 1.333, fluid через clamp()
        label: ['clamp(0.6875rem, 0.66rem + 0.14vw, 0.8125rem)', { lineHeight: '1.2' }],
        small: ['clamp(0.8125rem, 0.78rem + 0.17vw, 0.9375rem)', { lineHeight: '1.5' }],
        base: ['clamp(1.0625rem, 1.02rem + 0.22vw, 1.1875rem)', { lineHeight: '1.65' }],
        lead: ['clamp(1.1875rem, 1.08rem + 0.55vw, 1.5rem)', { lineHeight: '1.55' }],
        h4: ['clamp(1.125rem, 1.02rem + 0.5vw, 1.375rem)', { lineHeight: '1.35' }],
        h3: ['clamp(1.5rem, 1.28rem + 1.1vw, 2.25rem)', { lineHeight: '1.2' }],
        // Интерлиньяж с запасом: у кириллической антиквы длинные выносные
        h2: ['clamp(2.25rem, 1.7rem + 2.75vw, 4rem)', { lineHeight: '1.1' }],
        h1: ['clamp(2.75rem, 1.8rem + 4.9vw, 6.5rem)', { lineHeight: '1.02' }],
        mega: ['clamp(3.5rem, 1.6rem + 9vw, 11rem)', { lineHeight: '0.95' }],
      },
      letterSpacing: {
        plaque: '0.12em',
        wide2: '0.2em',
      },
      maxWidth: {
        prose2: '68ch',
      },
      transitionTimingFunction: {
        museum: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '0.9' },
          '45%': { opacity: '1' },
          '52%': { opacity: '0.72' },
          '58%': { opacity: '0.97' },
        },
      },
      animation: {
        flicker: 'flicker 7s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
