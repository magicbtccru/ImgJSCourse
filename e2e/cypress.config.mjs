import { defineConfig } from 'cypress'

export default defineConfig({
  defaultCommandTimeout: 20_000,
  requestTimeout: 20_000,

  e2e: {
    baseUrl: 'http://localhost:1121',
    specPattern: 'cypress/integration/*main.spec.ts',
  },
})
