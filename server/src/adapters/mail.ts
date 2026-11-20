import nodemailer from 'nodemailer'
import type { MailSender } from '../enquiries/service'

export function createMailSender(env: NodeJS.ProcessEnv): MailSender {
  const to = env.SALES_EMAIL || 'sales@example.test'
  const from = env.SMTP_FROM || 'catalogue@example.test'
  // Capture mode previews fabricated enquiries in local development without an SMTP server.
  if (env.ENQUIRY_MODE === 'capture') {
    if (env.NODE_ENV === 'production') throw new Error('Capture is a development mode')
    return async mail => { console.info('Local enquiry captured:', { to, from, ...mail }) }
  }
  // Use the configured SMTP relay. Docker points this transport at Mailpit for local testing.
  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST || '127.0.0.1', port: Number(env.SMTP_PORT || 1025),
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
