import { categorySlug, type Product } from '../../../shared/catalogue'

export type ProductSource = () => Promise<Product[]>
export const featuredIds = [1, 3, 5, 9, 15]
export function categories(products: Product[]) {
  return [...new Set(products.map(product => product.category))].sort().map(name => ({ name, slug: categorySlug(name) }))
}
export function rank(products: Product[]) {
  return [...products].sort((a, b) => b.rating.rate - a.rating.rate || b.rating.count - a.rating.count || a.id - b.id)
}
