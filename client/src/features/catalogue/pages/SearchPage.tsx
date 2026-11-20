import { useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { QueryState } from '../../../components/QueryState'
import { catalogueApi } from '../api/catalogueApi'
import { ProductGrid } from '../components/ProductGrid'
import { useCatalogueQuery } from '../hooks/useCatalogueQuery'

function SearchEmpty({ term }: { term: string }) {
  const recovery = useCatalogueQuery(catalogueApi.home)
  return <>
    <section className="search-empty" aria-labelledby="search-heading">
      <span className="search-empty-icon" aria-hidden="true" />
      <h1 id="search-heading" role="status">There are no search results for “{term}”.</h1>
      <p>Check your spelling, try a broader keyword, or explore the categories and products below.</p>
    </section>
    <QueryState {...recovery}>{data => <>
      <section className="search-recovery" aria-labelledby="explore-categories">
        <h2 id="explore-categories">Explore categories</h2>
        <ul className="recovery-categories">{data.categories.map(category =>
          <li key={category.slug}>
            <Link to={`/categories/${category.slug}`}>
              {category.image && <img src={category.image} alt="" loading="lazy" />}
              <span>{category.name}</span>
            </Link>
          </li>
        )}</ul>
      </section>
      <section className="search-recovery" aria-labelledby="search-recommendations">
        <h2 id="search-recommendations">Recommended products</h2>
        <ProductGrid products={data.featured} />
      </section>
    </>}</QueryState>
  </>
}

function Results({ term }: { term: string }) {
  const query = useCatalogueQuery(useCallback(signal => catalogueApi.search(term, signal), [term]))
  return <QueryState {...query}>{products => products.length
    ? <><h1>Search results</h1><ProductGrid products={products} /></>
    : <SearchEmpty term={term} />}</QueryState>
}

export function SearchPage() {
  const [params] = useSearchParams()
  const term = params.get('q')?.trim()
  return term ? <Results term={term} /> : <Link to="/">Browse the catalogue</Link>
}
