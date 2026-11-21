import { Link } from 'react-router-dom'
import type { Product } from '@shared/catalogue'

export const formatPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format

export function ProductCard({ product, categoryFilter }: { product: Product; categoryFilter?: string }) {
  return <Link className="card" to={`/products/${product.id}`} state={categoryFilter ? { categoryFilter } : undefined}>
    <img src={product.image} alt="" loading="lazy" />
    <div className="card-body">
      <span className="category">{product.category}</span>
      <h3>{product.title}</h3>
      <div className="card-meta"><strong>{formatPrice(product.price)}</strong><span>★ {product.rating.rate} / 5</span></div>
    </div>
  </Link>
}
