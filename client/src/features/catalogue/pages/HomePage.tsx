import { Link } from 'react-router-dom'
import { QueryState } from '@/components'
import { catalogueApi } from '@/features/catalogue/api/catalogueApi'
import { CategoryFilters, HomeCarousel, ProductGrid } from '@/features/catalogue/components'
import { useCatalogueQuery } from '@/features/catalogue/hooks/useCatalogueQuery'
import styles from './HomePage.module.css'

export function HomePage() {
  const query = useCatalogueQuery(catalogueApi.home)
  return <QueryState {...query}>{data => <>
    <CategoryFilters categories={data.categories} />
    <HomeCarousel featured={data.featured} />
    <section className="featured-section" aria-labelledby="featured-products">
      <div className={styles.featuredHeading}>
        <h2 id="featured-products">Featured products</h2>
        <Link to="/products">See all products</Link>
      </div>
      <ProductGrid products={data.featured} />
    </section>
  </>}</QueryState>
}
