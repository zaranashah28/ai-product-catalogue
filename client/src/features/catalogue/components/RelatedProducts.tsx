import { useCallback } from 'react'
import { catalogueApi } from '../api/catalogueApi'
import { useCatalogueQuery } from '../hooks/useCatalogueQuery'
import { ProductGrid } from './ProductGrid'

export function RelatedProducts({ slug, productId }: { slug: string; productId: number }) {
  const { result } = useCatalogueQuery(useCallback(signal => catalogueApi.category(slug, signal), [slug]))
  if (!('data' in result)) return null

  const { featured, additional } = result.data
  const products = [...featured, ...additional].filter(product => product.id !== productId).slice(0, 4)
  if (!products.length) return null

  return <section className="featured-section" aria-labelledby="related-products">
    <h2 id="related-products">You might also like</h2>
    <ProductGrid products={products} />
  </section>
}
