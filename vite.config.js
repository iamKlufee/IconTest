const { defineConfig } = require('vite')
const react = require('@vitejs/plugin-react')

module.exports = defineConfig({
  plugins: [react()],
  base: '/ReseachBub/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
}) 