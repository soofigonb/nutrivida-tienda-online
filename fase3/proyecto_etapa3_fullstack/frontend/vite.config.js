import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  test: {
    // ========================================
    // 1. ENTORNO DE PRUEBAS
    // ========================================

    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',

    // ========================================
    // 2. COBERTURA DE CÓDIGO
    // ========================================

    coverage: {
      provider: 'v8',

      // Carpeta donde se generan los reportes.
      reportsDirectory: './coverage',

      // Resumen en terminal, reporte visual y datos para el informe.
      reporter: ['text', 'html', 'json-summary'],

      // Incluir también archivos de la aplicación sin pruebas.
      include: ['src/**/*.{js,jsx}'],

      // Excluir pruebas, configuración del entorno
      // y el punto de montaje de React.
      exclude: [
        'src/**/*.test.{js,jsx}',
        'src/setupTests.js',
        'src/main.jsx',
      ],
    },
  },
})