import express, { type ErrorRequestHandler } from 'express'
import { categories, featuredIds, rank, type ProductSource } from './catalogue/service'
import { searchProducts } from './catalogue/search'
import { enquirySchema, sendEnquiry, type MailSender } from './enquiries/service'
import { fetchProductImage } from './adapters/products'
import { categorySlug, type Product } from '../../shared/catalogue'

// Give the browser a same-origin image URL so the server can enforce proxy limits and provide a fallback.
const serialize = (product: Product) => ({ ...product, image: `/api/products/${product.id}/image` })
const placeholder = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240"><rect width="320" height="240" fill="#eef0e9"/><path d="M110 96l50-28 50 28v58l-50 28-50-28z M110 96l50 28 50-28 M160 124v58" fill="none" stroke="#819284" stroke-width="3"/></svg>'

// Inject catalogue loading and mail delivery so routes can use different providers and tests can supply fixtures.
export function createApp(source: ProductSource, send: MailSender) {
  const app = express()
  app.disable('x-powered-by')
  app.use(express.json({ limit: '8kb' }))
  const find = async (id: string) => /^\d+$/.test(id) ? (await source()).find(product => product.id === Number(id)) : undefined

  // The home response combines curated products with the category list used for navigation.
  app.get('/api/catalogue/home', async (_, res) => {
    const products = await source()
    const featured = featuredIds.map(id => products.find(product => product.id === id))
    if (!featured.every(product => product !== undefined)) return res.status(503).json({ message: 'Featured products are unavailable.' })
    const navigation = categories(products).map(category => {
      const representative = products.find(product => product.category === category.name)
      return { ...category, image: representative ? serialize(representative).image : undefined }
    })
    res.json({ categories: navigation, featured: featured.map(serialize) })
  })
  // Rank category products once before splitting them into the featured and remaining groups.
  app.get('/api/categories/:slug', async (req, res) => {
    const products = await source()
    const category = categories(products).find(item => item.slug === req.params.slug)
    if (!category) return res.status(404).json({ message: 'Category not found.' })
    const sorted = rank(products.filter(item => categorySlug(item.category) === category.slug)).map(serialize)
    res.json({ category, featured: sorted.slice(0, 3), additional: sorted.slice(3) })
  })
  app.get('/api/products', async (req, res) => {
    const query = req.query.q
    if (typeof query !== 'string' || !query.trim() || query.length > 120) return res.status(400).json({ message: 'Enter a search term of up to 120 characters.' })
    const term = query.trim().toLowerCase()
    res.json(searchProducts(await source(), term).map(serialize))
  })
  app.get('/api/products/:id', async (req, res) => {
    const product = await find(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found.' })
    res.json(serialize(product))
  })
  app.get('/api/products/:id/image', async (req, res) => {
    const product = await find(req.params.id)
    if (!product) return res.sendStatus(404)
    try {
      const image = await fetchProductImage(product.image)
      res.set('Cache-Control', 'public, max-age=300').type(image.type).send(image.body)
    } catch {
      res.set('Cache-Control', 'public, max-age=30').type('image/svg+xml').send(placeholder)
    }
  })
  // Resolve the product from the route and confirm the submission only after mail delivery accepts it.
  app.post('/api/products/:id/enquiries', async (req, res) => {
    const enquiry = enquirySchema.safeParse(req.body)
    if (!enquiry.success) {
      const fields = Object.fromEntries(enquiry.error.issues.map(issue => [issue.path[0] ?? 'form', issue.message]))
      return res.status(400).json({ message: 'Check your enquiry details.', fields })
    }
    const product = await find(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found.' })
    try {
      await sendEnquiry(send, product, enquiry.data)
      res.sendStatus(204)
    } catch {
      res.status(503).json({ message: 'We could not send your enquiry. Please try again.' })
    }
  })
  app.use('/api', (_, res) => { res.status(404).json({ message: 'Endpoint not found.' }) })
  const handleError: ErrorRequestHandler = (error, _, res, next) => {
    if (res.headersSent) return next(error)
    if (error.status === 400 || error.status === 413) {
      res.status(error.status).json({ message: error.status === 413 ? 'Request is too large.' : 'Invalid request.' })
      return
    }
    res.status(503).json({ message: 'The catalogue is temporarily unavailable.' })
  }
  app.use(handleError)
  return app
}
