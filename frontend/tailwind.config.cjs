module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        legalnexus: {
          navy: '#071027',
          charcoal: '#0b0f14',
          accent: '#00ffd5',
          slate: '#6b7280',
          soft: '#f8fafc'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui']
      }
    }
  },
  plugins: []
}
