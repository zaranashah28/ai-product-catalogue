import nodemailer from 'nodemailer'
import { LOOPBACK_HOST, PRODUCTION_ENV } from '../constants'
import { ENQUIRY_CAPTURE_LOG, ENQUIRY_CAPTURE_MODE } from '../enquiries/constants'
import type { MailSender } from '../enquiries/service'

export function createMailSender(env: NodeJS.ProcessEnv): MailSender {
  const to = env.SALES_EMAIL || 'sales@example.test'
  const from = env.SMTP_FROM || 'catalogue@example.test'
  // Capture mode previews fabricated enquiries in local development without an SMTP server.
  if (env.ENQUIRY_MODE === ENQUIRY_CAPTURE_MODE) {
    if (env.NODE_ENV === PRODUCTION_ENV) throw new Error('Capture is a development mode')
    return async mail => { console.info(ENQUIRY_CAPTURE_LOG, { to, from, ...mail }) }
  }
  // Use the configured SMTP relay. Docker points this transport at Mailpit for local testing.
  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST || LOOPBACK_HOST, port: Number(env.SMTP_PORT || 1025),
    secure: env.SMTP_SECURE === 'true',
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined,
    connectionTimeout: 5000, greetingTimeout: 5000, socketTimeout: 8000,
  })
  return async mail => {
    const result = await transport.sendMail({ to, from, ...mail })
    // Only report success when SMTP accepts a recipient.
    if (!result.accepted.length) throw new Error('Sales recipient rejected')
  }
}
