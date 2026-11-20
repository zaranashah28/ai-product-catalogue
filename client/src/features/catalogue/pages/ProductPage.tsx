import { useCallback, useLayoutEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { categorySlug } from '../../../../../shared/catalogue'
import { QueryState } from '../../../components/QueryState'
import { Spinner } from '../../../components/Spinner'
import { EnquiryForm } from '../../enquiry/components/EnquiryForm'
import { catalogueApi } from '../api/catalogueApi'
import { formatPrice } from '../components/ProductCard'
import { RelatedProducts } from '../components/RelatedProducts'
import { useCatalogueQuery } from '../hooks/useCatalogueQuery'

// Reserve space for the product layout while announcing the loading state.
function ProductLoader() {
  return <div className="detail">
    <div className="product-image skeleton loading-state" role="status">
      <Spinner />
      <span>Loading product details…</span>
    </div>
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
  // Reset the scroll position before painting when a related product opens in the same route.
  useLayoutEffect(() => {
    const viewport = document.scrollingElement ?? document.documentElement
    viewport.scrollTop = 0
  }, [id])
  const query = useCatalogueQuery(useCallback(signal => catalogueApi.product(id, signal), [id]))

  return <>
    <nav className="product-breadcrumb" aria-label="Breadcrumb"><Link to="/">Catalogue</Link></nav>
    <QueryState {...query} loading={<ProductLoader />}>{product => <article>
      <div className="detail">
        <div className="product-image"><img src={product.image} alt={product.title} /></div>
        <div className="product-summary">
          <p className="product-category category"><Link to={`/categories/${categorySlug(product.category)}`}>{product.category}</Link></p>
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
