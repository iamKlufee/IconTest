const { defineConfig } = require('vite')
const react = require('@vitejs/plugin-react')

module.exports = defineConfig({
  plugins: [react()],
  base: process.env.CF_PAGES ? '/' : '/ReseachBub/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
}) 