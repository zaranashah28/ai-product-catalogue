import { Link } from 'react-router-dom'
import { QueryState } from '../../../components/QueryState'
import { catalogueApi } from '../api/catalogueApi'
import { ProductGrid } from '../components/ProductGrid'
import { useCatalogueQuery } from '../hooks/useCatalogueQuery'

export function HomePage() {
  const query = useCatalogueQuery(catalogueApi.home)
  return <>
    <section className="intro"><h1>Find your next favourite.</h1><p>Browse the catalogue and enquire about products that catch your eye.</p></section>
    <QueryState {...query}>{data => <>
      <nav className="category-nav" aria-label="Product categories">{data.categories.map(category =>
        <Link key={category.slug} to={`/categories/${category.slug}`}>{category.name}</Link>)}</nav>
      <h2>Featured products</h2>
      <ProductGrid products={data.featured} />
    </>}</QueryState>
  </>
}
