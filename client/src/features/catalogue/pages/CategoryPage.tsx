import { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { QueryState } from '../../../components/QueryState'
import { catalogueApi } from '../api/catalogueApi'
import { ProductGrid } from '../components/ProductGrid'
import { useCatalogueQuery } from '../hooks/useCatalogueQuery'

export function CategoryPage() {
  const { slug = '' } = useParams()
  const query = useCatalogueQuery(useCallback(signal => catalogueApi.category(slug, signal), [slug]))
  return <QueryState {...query}>{data => <>
    <h1 className="category">{data.category.name}</h1>
    <h2>Top rated</h2><ProductGrid products={data.featured} />
    {data.additional.length > 0 && <><h2>More in this category</h2><ProductGrid products={data.additional} /></>}
  </>}</QueryState>
}
