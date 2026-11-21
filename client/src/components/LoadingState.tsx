import { Spinner } from './Spinner'

export function LoadingState({ label, className = 'loading-panel' }: { label: string; className?: string }) {
  return <div className={`loading-state ${className}`} role="status">
    <span className="loading-emblem" aria-hidden="true">
      <Spinner />
      <span className="brand-mark">F</span>
    </span>
    <span>{label}</span>
  </div>
}
