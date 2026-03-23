import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,       // no need to import describe/it/expect in every file
    environment: 'jsdom', // for pure functions; change to 'jsdom' later for React components
    setupFiles: ['./src/test/setup.ts'],
  },
})
