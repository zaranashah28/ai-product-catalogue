import { categorySlug, type Product } from '../../../shared/catalogue'

export type ProductSource = () => Promise<Product[]>
// The order of these curated IDs determines the homepage display order.
export const featuredIds = [1, 3, 5, 9, 15]
export function categories(products: Product[]) {
  return [...new Set(products.map(product => product.category))].sort().map(name => ({ name, slug: categorySlug(name) }))
}
export function rank(products: Product[]) {
  return [...products].sort((a, b) => b.rating.rate - a.rating.rate || b.rating.count - a.rating.count || a.id - b.id)
}

export async function findProduct(source: ProductSource, id: string) {
  if (!/^\d+$/.test(id)) return undefined
  return (await source()).find(product => product.id === Number(id))
}
