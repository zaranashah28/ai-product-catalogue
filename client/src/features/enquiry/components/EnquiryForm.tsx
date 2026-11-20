import { useState } from 'react'
import { Spinner } from '../../../components/Spinner'
import { useEnquiry } from '../hooks/useEnquiry'

export function EnquiryForm({ id }: { id: number }) {
  const [open, setOpen] = useState(false)
  const { state, submit } = useEnquiry(id)
  const pending = state.status === 'pending'
  const error = state.status === 'error' ? state.error : undefined
  // Focus the confirmation when it replaces the form after a successful submission.
  if (state.status === 'success') return <p className="confirmation" role="status" ref={element => element?.focus()} tabIndex={-1}><strong>Thank you.</strong> Your enquiry has been sent.</p>
  if (!open) return <button onClick={() => setOpen(true)}>Enquire</button>

  return <form className="enquiry" aria-label="Product enquiry" onSubmit={event => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    void submit({ name: String(data.get('name')), email: String(data.get('email')), message: String(data.get('message')) })
  }}>
    <h2>Product enquiry</h2>
    {error && <p role="alert">{error.message}</p>}
    <label htmlFor="enquiry-name">Name</label>
    <input autoFocus id="enquiry-name" name="name" autoComplete="name" required maxLength={100} aria-invalid={Boolean(error?.fields?.name)} aria-describedby={error?.fields?.name ? 'name-error' : undefined} />
    {error?.fields?.name && <span id="name-error">{error.fields.name}</span>}
    <label htmlFor="enquiry-email">Email</label>
    <input id="enquiry-email" name="email" type="email" autoComplete="email" required maxLength={254} aria-invalid={Boolean(error?.fields?.email)} aria-describedby={error?.fields?.email ? 'email-error' : undefined} />
    {error?.fields?.email && <span id="email-error">{error.fields.email}</span>}
    <label htmlFor="enquiry-message">Message (optional)</label>
    <textarea id="enquiry-message" name="message" rows={4} maxLength={2000} aria-invalid={Boolean(error?.fields?.message)} aria-describedby={error?.fields?.message ? 'message-error' : undefined} />
    {error?.fields?.message && <span id="message-error">{error.fields.message}</span>}
    <button disabled={pending}>{pending ? <><Spinner />Sending…</> : 'Send enquiry'}</button>
  </form>
}
