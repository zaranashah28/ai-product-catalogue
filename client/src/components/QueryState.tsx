import type { ReactNode } from 'react'
import { Spinner } from './Spinner'

// Share loading and retry behavior across pages while letting each page render its own data.
export function QueryState<T>({ result, retry, loading, children }: {
  result: { loading: true } | { error: string } | { data: T }
  retry: () => void
  loading?: ReactNode
  children: (data: T) => ReactNode
}) {
  if ('loading' in result) return loading ?? <div className="loading-state" role="status">
    <Spinner />
    <span>Loading products…</span>
  </div>
  if ('error' in result) return <div role="alert"><p>{result.error}</p><button onClick={retry}>Try again</button></div>
  return children(result.data)
}
