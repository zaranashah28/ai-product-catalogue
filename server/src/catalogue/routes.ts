import { Router } from 'express'
import { createCatalogueController } from './controller'
import type { ProductSource } from './service'

export function createCatalogueRouter(source: ProductSource) {
  const router = Router()
  const controller = createCatalogueController(source)

  router.get('/catalogue/home', controller.home)
  router.get('/catalogue/products', controller.allProducts)
  router.get('/categories/:slug', controller.category)
  router.get('/products', controller.search)
  router.get('/products/:id', controller.productDetails)
  router.get('/products/:id/image', controller.productImage)

  return router
}
