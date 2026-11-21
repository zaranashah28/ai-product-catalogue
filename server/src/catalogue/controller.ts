import type { Request, Response } from 'express'
import { HttpError } from '../middleware/errorHandler'
import { fetchProductImage } from '../adapters/products'
import { categorySlug, type Product } from '../../../shared/catalogue'
import { PRODUCT_NOT_FOUND_MESSAGE } from './constants'
import { searchProducts } from './search'
import { categories, featuredIds, findProduct, rank, type ProductSource } from './service'

// Give the browser a same-origin image URL so the server can enforce proxy limits and provide a fallback.
const serialize = (product: Product) => ({ ...product, image: `/api/products/${product.id}/image` })
const placeholder = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240"><rect width="320" height="240" fill="#eef0e9"/><path d="M110 96l50-28 50 28v58l-50 28-50-28z M110 96l50 28 50-28 M160 124v58" fill="none" stroke="#819284" stroke-width="3"/></svg>'

export function createCatalogueController(source: ProductSource) {
  // The home response combines curated products with the category list used for navigation.
  async function home(_req: Request, res: Response) {
    const products = await source()
    const featured = featuredIds.map(id => products.find(product => product.id === id))
    if (!featured.every(product => product !== undefined)) throw new HttpError(503, { message: 'Featured products are unavailable.' })
    const navigation = categories(products).map(category => {
      const representative = products.find(product => product.category === category.name)
      return { ...category, image: representative ? serialize(representative).image : undefined }
    })
    res.json({ categories: navigation, featured: featured.map(serialize) })
  }

  // Rank category products once before splitting them into the featured and remaining groups.
  async function category(req: Request<{ slug: string }>, res: Response) {
    const products = await source()
    const category = categories(products).find(item => item.slug === req.params.slug)
    if (!category) throw new HttpError(404, { message: 'Category not found.' })
    const sorted = rank(products.filter(item => categorySlug(item.category) === category.slug)).map(serialize)
    res.json({ category, featured: sorted.slice(0, 3), additional: sorted.slice(3) })
  }

  async function search(req: Request, res: Response) {
    const query = req.query.q
    if (typeof query !== 'string' || !query.trim() || query.length > 120) throw new HttpError(400, { message: 'Enter a search term of up to 120 characters.' })
    const term = query.trim().toLowerCase()
    res.json(searchProducts(await source(), term).map(serialize))
  }

  async function productDetails(req: Request<{ id: string }>, res: Response) {
    const product = await findProduct(source, req.params.id)
    if (!product) throw new HttpError(404, { message: PRODUCT_NOT_FOUND_MESSAGE })
    res.json(serialize(product))
  }

  async function productImage(req: Request<{ id: string }>, res: Response) {
    const product = await findProduct(source, req.params.id)
    if (!product) throw new HttpError(404)
    // Retry failed provider images sooner by caching the placeholder for less time.
    const image = await fetchProductImage(product.image).catch(() => undefined)
    const maxAge = image ? 300 : 30
    res.set('Cache-Control', `public, max-age=${maxAge}`)
      .type(image?.type ?? 'image/svg+xml')
      .send(image?.body ?? placeholder)
  }

  return { home, category, search, productDetails, productImage }
}
