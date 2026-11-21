import { z } from 'zod'
import { IMAGE_UNAVAILABLE_MESSAGE } from '../catalogue/constants'
import { featuredIds, type ProductSource } from '../catalogue/service'
import type { Product } from '../../../shared/catalogue'

// Upstream product provider used by the server. The browser calls our Express /api routes.
function productApiOrigin() {
  return new URL(process.env.PRODUCT_API_ORIGIN || 'https://fakestoreapi.com').origin
}
// Bundled products keep the catalogue usable on a cold start when the upstream service is unavailable.
const demo: Product[] = [
  [1, 'Trail Backpack', 'outdoors', 69, 4.8],
  [2, 'Canvas Daypack', 'outdoors', 45, 4.3],
  [3, 'Field Jacket', 'outdoors', 89, 4.7],
  [4, 'Insulated Bottle', 'outdoors', 25, 4.4],
  [5, 'Silver Pendant', 'accessories', 37, 4.6],
  [6, 'Canvas Belt', 'accessories', 21, 4.2],
  [9, 'Compact Drive', 'electronics', 59, 4.5],
  [15, 'Rain Shell', 'clothing', 79, 4.4],
].map(([id, title, category, price, rate]) => ({
  id: Number(id), title: String(title), category: String(category), price: Number(price),
  description: `${title} for everyday use.`, rating: { rate: Number(rate), count: 20 }, image: '',
}))

const product = z.object({
  id: z.number().int().positive(), title: z.string().min(1), description: z.string(),
  category: z.string().min(1), price: z.number().nonnegative(), image: z.url(),
  rating: z.object({ rate: z.number().min(0).max(5), count: z.number().int().nonnegative() }),
})

export function createProductSource(): ProductSource {
  let cache: { products: Product[]; expires: number } | undefined
  let pending: Promise<Product[]> | undefined
  async function load() {
    try {
      const response = await fetch(new URL('/products', productApiOrigin()), { signal: AbortSignal.timeout(2500) })
      if (!response.ok) throw new Error('Catalogue unavailable')
      const products = z.array(product).parse(await response.json())
      // Require unique IDs and all featured products before replacing the cached catalogue.
      if (new Set(products.map(item => item.id)).size !== products.length ||
          !featuredIds.every(id => products.some(item => item.id === id))) throw new Error('Invalid catalogue')
      cache = { products, expires: Date.now() + 300_000 }
    } catch {
      // Keep the last successful catalogue and retry the upstream sooner after a failure.
      cache = { products: cache?.products ?? demo, expires: Date.now() + 30_000 }
    }
    return cache.products
  }
  return () => {
    if (cache && cache.expires > Date.now()) return Promise.resolve(cache.products)
    // Share one refresh across concurrent requests when the cache expires.
    pending ??= load().finally(() => { pending = undefined })
    return pending
  }
}

export async function fetchProductImage(value: string) {
  // Restrict image requests to the known provider and disallow redirects.
  const url = new URL(value)
  if (url.origin !== productApiOrigin() || !url.pathname.startsWith('/img/')) throw new Error('Invalid image URL')
  const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(2500) })
  const type = response.headers.get('content-type')?.split(';')[0]
  if (!response.ok || !type || !['image/jpeg', 'image/png', 'image/webp'].includes(type)) throw new Error(IMAGE_UNAVAILABLE_MESSAGE)
  // Enforce the image size limit while streaming, even when Content-Length is unavailable.
  const reader = response.body?.getReader()
  if (!reader) throw new Error(IMAGE_UNAVAILABLE_MESSAGE)
  const chunks: Uint8Array[] = []
  let size = 0
  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    size += value.length
    if (size > 4_000_000) {
      await reader.cancel()
      throw new Error('Image too large')
    }
    chunks.push(value)
  }
  return { type, body: Buffer.concat(chunks) }
}
