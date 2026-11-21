import type { Product } from '../../../shared/catalogue'

export function searchProducts(products: Product[], term: string) {
  return products.filter(product =>
    product.title.toLowerCase().includes(term) || product.description.toLowerCase().includes(term))
}
