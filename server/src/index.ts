import { existsSync } from 'node:fs'
import { createApp } from './app'
import { createProductSource } from './adapters/products'
import { createMailSender } from './adapters/mail'

if (existsSync('.env')) process.loadEnvFile('.env')
const port = Number(process.env.PORT || 3001)
createApp(createProductSource(), createMailSender(process.env)).listen(port, '127.0.0.1', () => {
  console.info(`Catalogue API on http://127.0.0.1:${port}`)
})
