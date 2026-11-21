import { useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { QueryState } from '@/components'
import { catalogueApi } from '@/features/catalogue/api/catalogueApi'
import { ProductGrid } from '@/features/catalogue/components'
import { useCatalogueQuery } from '@/features/catalogue/hooks/useCatalogueQuery'
import styles from './SearchPage.module.css'

function SearchEmpty({ term }: { term: string }) {
  const recovery = useCatalogueQuery(catalogueApi.home)
  return <>
    <section className={styles.empty} aria-labelledby="search-heading">
      <span className={styles.icon} aria-hidden="true" />
      <h1 id="search-heading" role="status">No results for “{term}”</h1>
      <p>Check your spelling or try a broader search.</p>
      <Link className={styles.browse} to="/products">Browse all products</Link>
    </section>
    <QueryState {...recovery}>{data => <>
      <section className={styles.recovery} aria-labelledby="explore-categories">
        <h2 id="explore-categories">Explore categories</h2>
        <ul className={styles.categories}>{data.categories.map(category =>
          <li key={category.slug}>
            <Link to={`/categories/${category.slug}`}>
              {category.image && <img src={category.image} alt="" loading="lazy" />}
              <span>{category.name}</span>
            </Link>
          </li>
        )}</ul>
      </section>
      <section className={styles.recovery} aria-labelledby="search-recommendations">
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
