import type { Request, Response } from 'express'
import { HttpError } from '../middleware/errorHandler'
import { PRODUCT_NOT_FOUND_MESSAGE } from '../catalogue/constants'
import { findProduct, type ProductSource } from '../catalogue/service'
import { enquirySchema, sendEnquiry, type MailSender } from './service'

export function createEnquiryController(source: ProductSource, send: MailSender) {
  // Resolve the product from the route and confirm the submission only after mail delivery accepts it.
  return async function submitEnquiry(req: Request<{ id: string }>, res: Response) {
    const enquiry = enquirySchema.safeParse(req.body)
    if (!enquiry.success) {
      const fields = Object.fromEntries(enquiry.error.issues.map(issue => [issue.path[0] ?? 'form', issue.message]))
      throw new HttpError(400, { message: 'Check your enquiry details.', fields })
    }
    const product = await findProduct(source, req.params.id)
    if (!product) throw new HttpError(404, { message: PRODUCT_NOT_FOUND_MESSAGE })
    try {
      await sendEnquiry(send, product, enquiry.data)
    } catch {
      throw new HttpError(503, { message: 'We could not send your enquiry. Please try again.' })
    }
    res.sendStatus(204)
  }
}
