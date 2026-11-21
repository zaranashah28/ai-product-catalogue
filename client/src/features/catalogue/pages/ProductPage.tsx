import { useCallback, useLayoutEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { categorySlug } from '@shared/catalogue'
import { LoadingState, QueryState } from '@/components'
import { EnquiryForm } from '@/features/enquiry/components'
import { catalogueApi } from '@/features/catalogue/api/catalogueApi'
import { CatalogueBreadcrumb, formatPrice, RelatedProducts } from '@/features/catalogue/components'
import { useCatalogueQuery } from '@/features/catalogue/hooks/useCatalogueQuery'

// Reserve space for the product layout while announcing the loading state.
function ProductLoader() {
  return <div className="detail">
    <LoadingState className="product-image loading-panel" label="Loading product details…" />
    <div className="product-summary" aria-hidden="true">
      <div className="skeleton skeleton-category" />
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-rating" />
      <div className="skeleton skeleton-price" />
      <div className="skeleton skeleton-action" />
    </div>
  </div>
}

export function ProductPage() {
  const { id = '' } = useParams()
  const { state } = useLocation()
  // Reset the scroll position before painting when a related product opens in the same route.
  useLayoutEffect(() => {
    const viewport = document.scrollingElement ?? document.documentElement
    viewport.scrollTop = 0
  }, [id])
  const query = useCatalogueQuery(useCallback(signal => catalogueApi.product(id, signal), [id]))
  const product = 'data' in query.result ? query.result.data : undefined
  const slug = product && categorySlug(product.category)
  // Show a category crumb only when the visitor opened the product through that category filter.
  const category = product && slug && slug === state?.categoryFilter
    ? { name: product.category, slug }
    : undefined

  return <>
    <CatalogueBreadcrumb current={product?.title} category={category} />
    <QueryState {...query} loading={<ProductLoader />}>{product => <article>
      <div className="detail">
        <div className="product-image"><img src={product.image} alt={product.title} /></div>
        <div className="product-summary">
          <p className="product-category category">{product.category}</p>
          <h1>{product.title}</h1>
          <p className="product-rating"><span aria-hidden="true">★</span> {product.rating.rate} / 5 <span>({product.rating.count} reviews)</span></p>
          <div className="product-enquiry">
            <p className="product-price">{formatPrice(product.price)}</p>
            <EnquiryForm key={product.id} id={product.id} />
          </div>
        </div>
      </div>
      <section className="product-description" aria-labelledby="product-description">
        <h2 id="product-description">Product details</h2>
        <p>{product.description}</p>
      </section>
      <RelatedProducts slug={categorySlug(product.category)} productId={product.id} />
    </article>}</QueryState>
  </>
}
