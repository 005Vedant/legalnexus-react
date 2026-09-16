module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        bg2: 'var(--bg-2)',
        band: 'var(--band)',
        card: 'var(--card)',
        cardsolid: 'var(--card-solid)',
        card2: 'var(--card-2)',
        line: 'var(--line)',
        line2: 'var(--line-2)',
        ink: 'var(--ink)',
        inkstrong: 'var(--ink-strong)',
        muted: 'var(--muted)',
        faint: 'var(--faint)',
        accent: 'var(--accent)',
        accentsoft: 'var(--accent-soft)',
        accentink: 'var(--accent-ink)',
        gold: 'var(--gold)',
        goldink: 'var(--gold-ink)',
        goldsoft: 'var(--gold-soft)',
        good: 'var(--good)',
        legalnexus: {
          nav: '#0F1C2E',
          navy: '#071027',
          charcoal: '#0b0f14',
          accent: '#00ffd5',
          slate: '#6b7280',
          soft: '#f8fafc'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui'],
        display: ['Fraunces', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      }
    }
  },
  plugins: []
}
