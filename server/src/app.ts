import express from 'express'
import type { ProductSource } from './catalogue/service'
import type { MailSender } from './enquiries/service'
import { handleError } from './middleware/errorHandler'
import { createApiRouter } from './routes'

// Inject catalogue loading and mail delivery so routes can use different providers and tests can supply fixtures.
export function createApp(source: ProductSource, send: MailSender) {
  const app = express()
  app.disable('x-powered-by')
  app.use(express.json({ limit: '8kb' }))
  app.use('/api', createApiRouter(source, send))

  // Express forwards route failures here after the API router passes control.
  app.use(handleError)
  return app
}
