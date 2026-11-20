import { useEffect, useState } from 'react'

type Result<T> = { data: T } | { error: string } | { loading: true }

export function useCatalogueQuery<T>(load: (signal: AbortSignal) => Promise<T>) {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<{ load: typeof load; attempt: number; result: Result<T> }>()
  useEffect(() => {
    const controller = new AbortController()
    const update = (result: Result<T>) => {
      if (!controller.signal.aborted) setState({ load, attempt, result })
    }
    load(controller.signal).then(data => update({ data }), error => update({ error: error.message }))
    return () => controller.abort()
  }, [load, attempt])
  const result: Result<T> = state?.load === load && state.attempt === attempt ? state.result : { loading: true }
  return { result, retry: () => setAttempt(count => count + 1) }
}
