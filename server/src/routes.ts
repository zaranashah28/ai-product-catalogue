import { Router } from 'express'
import { createCatalogueRouter } from './catalogue/routes'
import type { ProductSource } from './catalogue/service'
import { createEnquiryRouter } from './enquiries/routes'
import type { MailSender } from './enquiries/service'
import { HttpError } from './middleware/errorHandler'

export function createApiRouter(source: ProductSource, send: MailSender) {
  const router = Router()
  router.use(createCatalogueRouter(source))
  router.use(createEnquiryRouter(source, send))

  // Keep the API's JSON 404 separate from the frontend's page routes.
  router.use(() => { throw new HttpError(404, { message: 'Endpoint not found.' }) })

  return router
}
