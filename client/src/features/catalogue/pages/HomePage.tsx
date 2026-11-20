import { QueryState } from '../../../components/QueryState'
import { catalogueApi } from '../api/catalogueApi'
import { CategoryFilters } from '../components/CategoryFilters'
import { ProductGrid } from '../components/ProductGrid'
import { useCatalogueQuery } from '../hooks/useCatalogueQuery'

export function HomePage() {
  const query = useCatalogueQuery(catalogueApi.home)
  return <QueryState {...query}>{data => <>
    <CategoryFilters categories={data.categories} />
    <section className="storefront-hero">
      <div className="hero-copy">
        <h1>Find your next<br />everyday favourite.</h1>
        <p>Explore the catalogue and enquire directly about the products you’re interested in.</p>
        <a className="hero-action" href="#featured-products">Browse featured products</a>
      </div>
      <div className="hero-products" aria-hidden="true">
        {data.featured.slice(0, 3).map(product =>
          <div className="hero-product" key={product.id}><img src={product.image} alt="" /></div>
        )}
      </div>
    </section>
    <section className="featured-section" aria-labelledby="featured-products">
      <h2 id="featured-products">Featured products</h2>
      <ProductGrid products={data.featured} />
    </section>
  </>}</QueryState>
}
