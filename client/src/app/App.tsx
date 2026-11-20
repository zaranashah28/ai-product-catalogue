import { Link, Route, Routes } from 'react-router-dom'
import { SearchForm } from '../features/catalogue/components/SearchForm'
import { HomePage } from '../features/catalogue/pages/HomePage'
import { CategoryPage } from '../features/catalogue/pages/CategoryPage'
import { SearchPage } from '../features/catalogue/pages/SearchPage'
import { ProductPage } from '../features/catalogue/pages/ProductPage'

export function App() {
  return <>
    <header><div className="shell header-inner"><Link className="brand" to="/"><span className="brand-mark" aria-hidden="true">F</span>Fieldwork</Link><SearchForm /></div></header>
    <main className="shell">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/categories/:slug" element={<CategoryPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/products/:id" element={<ProductPage />} />
        <Route path="*" element={<><h1>Page not found</h1><Link to="/">Browse the catalogue</Link></>} />
      </Routes>
    </main>
    <footer className="site-footer"><div className="shell"><Link to="/">Fieldwork</Link></div></footer>
  </>
}
