import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { QueryState } from '../../../components/QueryState'
import { catalogueApi } from '../api/catalogueApi'
import { ProductGrid } from '../components/ProductGrid'
import { useCatalogueQuery } from '../hooks/useCatalogueQuery'

function Results({ term }: { term: string }) {
  const query = useCatalogueQuery(useCallback(signal => catalogueApi.search(term, signal), [term]))
  return <QueryState {...query}>{products => products.length
    ? <ProductGrid products={products} />
    : <p role="status">No products match “{term}”. Try another search.</p>}</QueryState>
}

export function SearchPage() {
  const [params] = useSearchParams()
  const term = params.get('q')?.trim()
  return <><h1>Search results</h1>{term ? <Results term={term} /> : <p>Enter a search term to find products.</p>}</>
}
