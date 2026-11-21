import { Link } from 'react-router-dom'
import type { Product } from '@shared/catalogue'

type SlideProps = { spotlights: Product[]; index: number }

export function HomeCarouselCopy({ spotlights, index }: SlideProps) {
  // Keep the stacked panels mounted for consistent layout. Only the active panel can receive focus.
  return <div className="carousel-stack">
    <div className="hero-copy" data-active={index === 0} aria-hidden={index !== 0} inert={index !== 0}>
      <h1>Find your next<br />everyday favourite.</h1>
      <p>Explore the catalogue and enquire directly about the products you’re interested in.</p>
      <a className="hero-action" href="#featured-products">Browse featured products</a>
    </div>
    {spotlights.map((product, slide) => {
      const active = index === slide + 1
      return <div className="hero-copy" key={product.id} data-active={active} aria-hidden={!active} inert={!active}>
        <h1>{product.title}</h1>
        <p className="category">{product.category}</p>
        <Link className="hero-action" to={`/products/${product.id}`}>View product</Link>
      </div>
    })}
  </div>
}

export function HomeCarouselArt({ featured, spotlights, index }: SlideProps & { featured: Product[] }) {
  return <div className="carousel-stack" aria-hidden="true">
    <div className="hero-products carousel-art" data-active={index === 0}>
      {featured.slice(0, 3).map(product =>
        <div className="hero-product" key={product.id}><img src={product.image} alt="" /></div>
      )}
    </div>
    {spotlights.map((product, slide) =>
      <div className="hero-spotlight-image carousel-art" key={product.id} data-active={index === slide + 1}>
        <img src={product.image} alt="" />
      </div>
    )}
  </div>
}
