import { z } from 'zod'
import type { Enquiry, Product } from '../../../shared/catalogue'

export const enquirySchema = z.object({
  name: z.string().trim().min(1, 'Enter your name.').max(100),
  email: z.string().trim().max(254).pipe(z.email('Enter a valid email.')),
  message: z.string().trim().max(2000).optional(),
})
export type Mail = { replyTo: string; subject: string; text: string }
export type MailSender = (mail: Mail) => Promise<void>
export function sendEnquiry(send: MailSender, product: Product, enquiry: Enquiry) {
  return send({
    replyTo: enquiry.email,
    subject: `Catalogue enquiry · product #${product.id}`,
    text: `Product: ${product.title} (#${product.id})\nName: ${enquiry.name}\nEmail: ${enquiry.email}\n\n${enquiry.message ?? ''}`,
  })
}
