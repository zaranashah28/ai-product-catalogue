import { Link } from 'react-router-dom'
import styles from './CatalogueBreadcrumb.module.css'

export function CatalogueBreadcrumb({ current, category }: {
  current?: string
  category?: { name: string; slug: string }
}) {
  return <nav className={styles.breadcrumb} aria-label="Breadcrumb">
    <ol>
      <li><Link to="/">Catalogue</Link></li>
      {category && <li><Link className="category" to={`/categories/${category.slug}`}>{category.name}</Link></li>}
      {current && <li className={styles.current}><span aria-current="page">{current}</span></li>}
    </ol>
  </nav>
}
