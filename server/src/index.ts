import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import express from 'express'
import { createApp } from './app'
import { createProductSource } from './adapters/products'
import { createMailSender } from './adapters/mail'

// Load local settings before creating the adapters. Compose supplies its settings through the environment.
if (existsSync('.env')) process.loadEnvFile('.env')
const port = Number(process.env.PORT || 3001)
const host = process.env.HOST || '127.0.0.1'
const { CATALOGUE_URL, MAILPIT_URL } = process.env
const app = createApp(createProductSource(), createMailSender(process.env))

// In production Express serves the built frontend and supports direct visits to client routes.
if (process.env.NODE_ENV === 'production') {
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
