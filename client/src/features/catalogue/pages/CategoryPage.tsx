import { useCallback } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { QueryState } from '@/components'
import { catalogueApi } from '@/features/catalogue/api/catalogueApi'
import { CategoryFilters, ProductGrid } from '@/features/catalogue/components'
import { useCatalogueQuery } from '@/features/catalogue/hooks/useCatalogueQuery'

function CategoryProducts({ slug, combined }: { slug: string; combined: boolean }) {
  const query = useCatalogueQuery(useCallback(signal => catalogueApi.category(slug, signal), [slug]))
  const CategoryHeading = combined ? 'h2' : 'h1'
  const GroupHeading = combined ? 'h3' : 'h2'

  return <QueryState {...query}>{data => <section className="category-section">
    <CategoryHeading className="category">{data.category.name}</CategoryHeading>
    <GroupHeading>Top rated</GroupHeading>
    <ProductGrid products={data.featured} categoryFilter={data.category.slug} />
    {data.additional.length > 0 && <>
      <GroupHeading>More in this category</GroupHeading>
      <ProductGrid products={data.additional} categoryFilter={data.category.slug} />
    </>}
  </section>}</QueryState>
}

export function CategoryPage() {
  const { slug = '' } = useParams()
  const [params] = useSearchParams()
  const catalogue = useCatalogueQuery(catalogueApi.home)

  return <QueryState {...catalogue}>{data => {
    const available = new Set(data.categories.map(category => category.slug))
    const selected = [...new Set([slug, ...params.getAll('category').filter(value => available.has(value))])]
    return <>
      <CategoryFilters categories={data.categories} selected={selected} />
      {selected.length > 1 && <h1>Selected categories</h1>}
      {selected.map(value => <CategoryProducts key={value} slug={value} combined={selected.length > 1} />)}
    </>
  }}</QueryState>
}
