import type { ErrorRequestHandler } from 'express'
import type { ApiError } from '../../../shared/catalogue'

// An omitted body preserves Express's plain-text response for status-only errors.
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly body?: ApiError,
  ) {
    super(body?.message)
  }
}

export const handleError: ErrorRequestHandler = (error, _, res, next) => {
  if (res.headersSent) return next(error)

  if (error instanceof HttpError) {
    if (error.body) res.status(error.status).json(error.body)
    else res.sendStatus(error.status)
    return
  }

  // The JSON body parser runs before route handlers and reports its own errors.
  if (error?.status === 400 || error?.status === 413) {
    res.status(error.status).json({ message: error.status === 413 ? 'Request is too large.' : 'Invalid request.' })
    return
  }

  res.status(503).json({ message: 'The catalogue is temporarily unavailable.' })
}
