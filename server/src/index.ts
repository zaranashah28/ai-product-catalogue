import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import express from 'express'
import { createApp } from './app'
import { createProductSource } from './adapters/products'
import { createMailSender } from './adapters/mail'
import { LOCAL_ENV_FILE, LOOPBACK_HOST, PRODUCTION_ENV } from './constants'

// Load local settings before creating the adapters. Compose supplies its settings through the environment.
if (existsSync(LOCAL_ENV_FILE)) process.loadEnvFile(LOCAL_ENV_FILE)
const port = Number(process.env.PORT || 3001)
const host = process.env.HOST || LOOPBACK_HOST
const { CATALOGUE_URL, MAILPIT_URL } = process.env
const app = createApp(createProductSource(), createMailSender(process.env))

// In production Express serves the built frontend and supports direct visits to client routes.
if (process.env.NODE_ENV === PRODUCTION_ENV) {
  const clientDir = resolve('client/dist')
  const index = resolve(clientDir, 'index.html')
  app.use(express.static(clientDir))
  app.get(['/', '/search', '/categories/:slug', '/products/:id'], (_, res) => {
    res.sendFile(index)
  })
}

// Compose supplies browser-facing URLs because the container's bind address is internal.
app.listen(port, host, () => {
  console.info(`Catalogue  ${CATALOGUE_URL || `http://${host}:${port}`}`)
  if (MAILPIT_URL) console.info(`Mailpit    ${MAILPIT_URL}`)
})
