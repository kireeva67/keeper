import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        env: {
            GOOGLE_CLIENT_ID: 'test',
            GOOGLE_CLIENT_SECRET: 'test',
            CLIENT_URL: 'http://localhost:5173',
            API_URL: 'http://localhost:3000',
        }
    },

})
