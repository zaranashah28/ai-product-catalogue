import { useLayoutEffect } from 'react'
import { QueryState } from '@/components'
import { catalogueApi } from '@/features/catalogue/api/catalogueApi'
import { CatalogueBreadcrumb } from '@/features/catalogue/components'
import { useCatalogueQuery } from '@/features/catalogue/hooks/useCatalogueQuery'
import { ProgressiveProductGrid } from './ProgressiveProductGrid'
import styles from './AllProductsPage.module.css'

export function AllProductsPage() {
  const query = useCatalogueQuery(catalogueApi.all)

  useLayoutEffect(() => {
    const viewport = document.scrollingElement ?? document.documentElement
    viewport.scrollTop = 0
  }, [])

  return <>
    <CatalogueBreadcrumb current="All products" />
    <h1 className={styles.title}>All products</h1>
    <QueryState {...query}>{products => products.length
      ? <ProgressiveProductGrid products={products} />
      : <p>No products are available.</p>}</QueryState>
  </>
}
