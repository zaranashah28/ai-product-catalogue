import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import express from 'express'
import { createApp } from './app'
import { createProductSource } from './adapters/products'
import { createMailSender } from './adapters/mail'

if (existsSync('.env')) process.loadEnvFile('.env')
const port = Number(process.env.PORT || 3001)
const host = process.env.HOST || '127.0.0.1'
const app = createApp(createProductSource(), createMailSender(process.env))

if (process.env.NODE_ENV === 'production') {
  const clientDir = resolve('client/dist')
  const index = resolve(clientDir, 'index.html')
  app.use(express.static(clientDir))
  app.get(['/', '/search', '/categories/:slug', '/products/:id'], (_, res) => {
    res.sendFile(index)
  })
}

app.listen(port, host, () => {
  console.info(`Catalogue listening on http://${host}:${port}`)
})
