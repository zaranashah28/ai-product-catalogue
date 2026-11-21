import { useCallback, useEffect, useRef, useState } from 'react'
import type { Product } from '@shared/catalogue'
import { ProductGrid } from '@/features/catalogue/components'
import styles from './ProgressiveProductGrid.module.css'

const PRODUCTS_PER_BATCH = 8

export function ProgressiveProductGrid({ products }: { products: Product[] }) {
  const [limit, setLimit] = useState(PRODUCTS_PER_BATCH)
  const loadMoreButton = useRef<HTMLButtonElement>(null)
  const visibleCount = Math.min(limit, products.length)
  const hasMore = visibleCount < products.length

  const showMore = useCallback(() => {
    // A click and a scroll can request the same batch at nearly the same time.
    setLimit(current => Math.max(current, visibleCount + PRODUCTS_PER_BATCH))
  }, [visibleCount])

  useEffect(() => {
    const button = loadMoreButton.current
    if (!button || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) showMore()
    })
    observer.observe(button)
    return () => observer.disconnect()
  }, [hasMore, showMore])

  return <>
    <ProductGrid products={products.slice(0, visibleCount)} />
    <div className={styles.progress}>
      <p role="status">Showing {visibleCount} of {products.length} products</p>
      {hasMore && <button ref={loadMoreButton} type="button" onClick={showMore}>Load more</button>}
    </div>
  </>
}
