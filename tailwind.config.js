/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0A0A0A',
        'ink-2': '#111111',
        'ink-3': '#1A1A1A',
        'ink-4': '#242220',
        bone: '#F5F1E8',
        'bone-muted': '#A8A399',
        'gold-1': '#5C4620',
        'gold-2': '#8B6A2F',
        'gold-3': '#C9A24E',
        'gold-4': '#E8C472',
        'gold-5': '#FCE6A3',
        'live-red': '#E53935',
      },
      fontFamily: {
        display: ["'Oswald Variable'", "'Oswald'", "'Bebas Neue'", 'system-ui', 'sans-serif'],
        body: ["'Inter Variable'", "'Inter'", '-apple-system', 'system-ui', 'sans-serif'],
        script: ["'Caveat'", "'Segoe Script'", 'cursive'],
      },
      letterSpacing: {
        'data-tight': '0.02em',
        'data-loose': '0.05em',
        'label-sm': '0.12em',
        'label-md': '0.2em',
        'label-lg': '0.25em',
        'label-xl': '0.3em',
      },
      borderRadius: {
        card: '14px',
      },
      maxWidth: {
        content: '1440px',
      },
      /**
       * Layout tokens put into `spacing` so they cascade across every
       * spacing utility — `w-sidebar`, `ml-sidebar`, `left-sidebar`,
       * `pl-sidebar`, `h-topbar`, `pt-topbar` all resolve from here.
       * (Extending only `width` — as we did originally — silently broke
       * `ml-sidebar`/`left-sidebar` and let content slide under the fixed
       * sidebar.)
       */
      spacing: {
        sidebar: '240px',
        'sidebar-collapsed': '72px',
        topbar: '64px',
      },
      boxShadow: {
        'gold-glow': '0 0 40px rgba(201, 162, 78, 0.18)',
        'gold-glow-soft': '0 0 20px rgba(201, 162, 78, 0.12)',
        'card-depth': '0 20px 40px -12px rgba(0, 0, 0, 0.6), 0 8px 16px -8px rgba(0, 0, 0, 0.5)',
        'inset-gold': 'inset 0 0 0 1px rgba(201, 162, 78, 0.28)',
        'inset-gold-strong': 'inset 0 0 0 1px rgba(201, 162, 78, 0.5)',
        'topbar-bottom': '0 1px 0 0 rgba(168, 163, 153, 0.08)',
      },
      transitionTimingFunction: {
        cinematic: 'cubic-bezier(0.19, 1, 0.22, 1)',
        standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      backgroundImage: {
        'brushed-gold':
          'linear-gradient(110deg, #5C4620 0%, #8B6A2F 15%, #C9A24E 35%, #F0D286 50%, #C9A24E 65%, #8B6A2F 85%, #5C4620 100%)',
        'brushed-gold-v':
          'linear-gradient(180deg, #8B6A2F 0%, #C9A24E 45%, #F0D286 55%, #C9A24E 70%, #5C4620 100%)',
        'gold-floor':
          'radial-gradient(ellipse at 50% 100%, rgba(201, 162, 78, 0.35) 0%, rgba(139, 106, 47, 0.15) 35%, transparent 70%)',
        'gold-floor-intense':
          'radial-gradient(ellipse at 50% 100%, rgba(201, 162, 78, 0.48) 0%, rgba(139, 106, 47, 0.22) 40%, transparent 75%)',
        'gold-ceiling':
          'radial-gradient(ellipse at 50% 0%, rgba(201, 162, 78, 0.22) 0%, rgba(139, 106, 47, 0.08) 40%, transparent 70%)',
        'sidebar-base': 'linear-gradient(180deg, #101010 0%, #0E0D0B 100%)',
      },
      keyframes: {
        'gold-sweep': {
          '0%': { transform: 'translateX(-120%) skewX(-18deg)' },
          '100%': { transform: 'translateX(220%) skewX(-18deg)' },
        },
        'marquee-x': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'fade-rise': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'soft-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
        'float-y': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        'gold-sweep': 'gold-sweep 800ms cubic-bezier(0.19, 1, 0.22, 1)',
        marquee: 'marquee-x 28s linear infinite',
        'fade-rise': 'fade-rise 600ms cubic-bezier(0.19, 1, 0.22, 1) forwards',
        'soft-pulse': 'soft-pulse 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'float-y': 'float-y 2.4s cubic-bezier(0.4, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
};
