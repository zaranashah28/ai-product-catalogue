import { Link } from 'react-router-dom'
import type { Category } from '../../../../../shared/catalogue'

// Keep category selections in the URL so they survive refresh and can be shared.
function categoryPath([first, ...rest]: string[]) {
  if (!first) return '/'
  const params = new URLSearchParams()
  rest.forEach(slug => params.append('category', slug))
  return `/categories/${encodeURIComponent(first)}${rest.length ? `?${params}` : ''}`
}

export function CategoryFilters({ categories, selected = [] }: {
  categories: Category[]
  selected?: string[]
}) {
  return <nav className="category-nav" aria-label="Category filters">
    <Link to="/" data-selected={selected.length === 0}>
      {selected.length ? 'Clear filters' : 'All categories'}
    </Link>
    {categories.map(category => {
      const active = selected.includes(category.slug)
      const next = active ? selected.filter(slug => slug !== category.slug) : [...selected, category.slug]
      return <Link key={category.slug} to={categoryPath(next)} data-selected={active}
        aria-label={active ? `Remove ${category.name} filter` : undefined}>
        {category.name}{active && <span aria-hidden="true"> ×</span>}
      </Link>
    })}
  </nav>
}
