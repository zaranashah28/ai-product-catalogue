import axios from 'axios'
import type { ApiError } from '@shared/catalogue'

export class RequestError extends Error {
  constructor(message: string, public fields?: ApiError['fields']) { super(message) }
}
export const axiosClient = axios.create({ baseURL: '/api', timeout: 12000 })
axiosClient.interceptors.response.use(undefined, error => {
  if (axios.isCancel(error)) return Promise.reject(error)
  const data = axios.isAxiosError<ApiError>(error) ? error.response?.data : undefined
  return Promise.reject(new RequestError(data?.message ?? 'Unable to connect. Please try again.', data?.fields))
})
