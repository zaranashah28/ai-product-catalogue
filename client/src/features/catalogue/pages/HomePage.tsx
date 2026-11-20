import { QueryState } from '../../../components/QueryState'
import { catalogueApi } from '../api/catalogueApi'
import { CategoryFilters } from '../components/CategoryFilters'
import { HomeCarousel } from '../components/HomeCarousel'
import { ProductGrid } from '../components/ProductGrid'
import { useCatalogueQuery } from '../hooks/useCatalogueQuery'

export function HomePage() {
  const query = useCatalogueQuery(catalogueApi.home)
  return <QueryState {...query}>{data => <>
    <CategoryFilters categories={data.categories} />
    <HomeCarousel featured={data.featured} />
    <section className="featured-section" aria-labelledby="featured-products">
      <h2 id="featured-products">Featured products</h2>
      <ProductGrid products={data.featured} />
    </section>
  </>}</QueryState>
}
