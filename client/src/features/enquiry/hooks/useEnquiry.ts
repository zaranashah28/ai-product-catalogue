import { useRef, useState } from 'react'
import type { ApiError, Enquiry } from '@shared/catalogue'
import { RequestError } from '@/api/axiosClient'
import { submitEnquiry } from '@/features/enquiry/api/enquiryApi'

type State = { status: 'idle' | 'pending' | 'success' } | { status: 'error'; error: ApiError }

export function useEnquiry(id: number) {
  const [state, setState] = useState<State>({ status: 'idle' })
  // Block a second submission immediately, before React renders the disabled send button.
  const pending = useRef(false)
  async function submit(enquiry: Enquiry) {
    if (pending.current) return
    pending.current = true
    setState({ status: 'pending' })
    try {
      await submitEnquiry(id, enquiry)
      setState({ status: 'success' })
    } catch (error) {
      setState({ status: 'error', error: {
        message: error instanceof Error ? error.message : 'Unable to send your enquiry.',
        fields: error instanceof RequestError ? error.fields : undefined,
      } })
    } finally {
      pending.current = false
    }
  }
  return { state, submit }
}
