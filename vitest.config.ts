import { defineConfig } from 'vitest/config'
import clientConfig from './client/vite.config'

export default defineConfig({
  resolve: clientConfig.resolve,
})
