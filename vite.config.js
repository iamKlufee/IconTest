const { defineConfig } = require('vite')
const react = require('@vitejs/plugin-react')

module.exports = defineConfig({
  plugins: [react()],
  base: '/IconBub/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
}) 