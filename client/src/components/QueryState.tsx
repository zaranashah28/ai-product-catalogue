import type { ReactNode } from 'react'

export function QueryState<T>({ result, retry, children }: {
  result: { loading: true } | { error: string } | { data: T }
  retry: () => void
  children: (data: T) => ReactNode
}) {
  if ('loading' in result) return <p role="status">Loading products…</p>
  if ('error' in result) return <div role="alert"><p>{result.error}</p><button onClick={retry}>Try again</button></div>
  return children(result.data)
}
