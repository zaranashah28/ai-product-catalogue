import { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { QueryState } from '../../../components/QueryState'
import { EnquiryForm } from '../../enquiry/components/EnquiryForm'
import { catalogueApi } from '../api/catalogueApi'
import { formatPrice } from '../components/ProductCard'
import { useCatalogueQuery } from '../hooks/useCatalogueQuery'

export function ProductPage() {
  const { id = '' } = useParams()
  const query = useCatalogueQuery(useCallback(signal => catalogueApi.product(id, signal), [id]))
  return <QueryState {...query}>{product => <article className="detail">
    <img src={product.image} alt={product.title} />
    <div>
      <p className="category">{product.category}</p><h1>{product.title}</h1>
      <p><strong>{formatPrice(product.price)}</strong> · ★ {product.rating.rate} / 5 ({product.rating.count} reviews)</p>
      <p>{product.description}</p>
      <EnquiryForm key={product.id} id={product.id} />
    </div>
  </article>}</QueryState>
}
