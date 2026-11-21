import type { Product } from '@shared/catalogue'
import { ProductCard } from './ProductCard'

export function ProductGrid({ products, categoryFilter }: { products: Product[]; categoryFilter?: string }) {
  return <ul className="grid">
    {products.map(product => <li key={product.id}><ProductCard product={product} categoryFilter={categoryFilter} /></li>)}
  </ul>
}
