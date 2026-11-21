import { Router } from 'express'
import type { ProductSource } from '../catalogue/service'
import { createEnquiryController } from './controller'
import type { MailSender } from './service'

export function createEnquiryRouter(source: ProductSource, send: MailSender) {
  const router = Router()
  router.post('/products/:id/enquiries', createEnquiryController(source, send))
  return router
}
