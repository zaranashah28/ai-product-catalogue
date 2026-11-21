import type { Enquiry } from '@shared/catalogue'
import { axiosClient } from '@/api/axiosClient'

export async function submitEnquiry(id: number, enquiry: Enquiry) {
  await axiosClient.post(`/products/${id}/enquiries`, enquiry)
}
