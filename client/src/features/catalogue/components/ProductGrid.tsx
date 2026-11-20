import type { Product } from '../../../../../shared/catalogue'
import { ProductCard } from './ProductCard'

export function ProductGrid({ products }: { products: Product[] }) {
  return <ul className="grid">{products.map(product => <li key={product.id}><ProductCard product={product} /></li>)}</ul>
}
