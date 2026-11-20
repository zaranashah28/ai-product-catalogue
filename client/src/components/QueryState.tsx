import type { ReactNode } from 'react'

export function QueryState<T>({ result, retry, loading, children }: {
  result: { loading: true } | { error: string } | { data: T }
  retry: () => void
  loading?: ReactNode
  children: (data: T) => ReactNode
}) {
  if ('loading' in result) return loading ?? <p role="status">Loading products…</p>
  if ('error' in result) return <div role="alert"><p>{result.error}</p><button onClick={retry}>Try again</button></div>
  return children(result.data)
}
