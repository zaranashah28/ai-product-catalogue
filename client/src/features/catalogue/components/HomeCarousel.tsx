import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '../../../../../shared/catalogue'

export function HomeCarousel({ featured }: { featured: Product[] }) {
  const [index, setIndex] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)
  const spotlights = featured.slice(0, 2)
  const slideCount = spotlights.length + 1
  const product = spotlights[index - 1]
  const rotating = !hovered && !focused && !reduceMotion && slideCount > 1

  useEffect(() => {
    const preference = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    const onChange = (event: MediaQueryListEvent) => setReduceMotion(event.matches)
    preference?.addEventListener('change', onChange)
    return () => preference?.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!rotating) return
    const timer = window.setTimeout(() => setIndex(current => (current + 1) % slideCount), 6000)
    return () => window.clearTimeout(timer)
  }, [index, rotating, slideCount])

  function move(offset: number) {
    setIndex(current => (current + offset + slideCount) % slideCount)
  }

  return <section className="storefront-carousel" aria-label="Featured catalogue highlights" aria-roledescription="carousel"
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocus={() => setFocused(true)} onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false)
    }}>
    <div id="home-highlight" className="storefront-hero carousel-slide" data-spotlight={Boolean(product)}
      role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${slideCount}`}
      aria-live={rotating ? 'off' : 'polite'}>
      <div className="hero-copy" key={index}>
        {product ? <>
          <h1>{product.title}</h1>
          <p className="category">{product.category}</p>
          <Link className="hero-action" to={`/products/${product.id}`}>View product</Link>
        </> : <>
          <h1>Find your next<br />everyday favourite.</h1>
          <p>Explore the catalogue and enquire directly about the products you’re interested in.</p>
          <a className="hero-action" href="#featured-products">Browse featured products</a>
        </>}
      </div>
      <div className="carousel-visual">
        {slideCount > 1 && <button className="carousel-arrow" onClick={() => move(-1)} aria-controls="home-highlight" aria-label="Previous">
          <span className="carousel-chevron previous" aria-hidden="true" />
        </button>}
        {product ? <div className="hero-spotlight-image carousel-art" key={index}><img src={product.image} alt="" /></div>
          : <div className="hero-products carousel-art" key={index} aria-hidden="true">
            {featured.slice(0, 3).map(item =>
              <div className="hero-product" key={item.id}><img src={item.image} alt="" /></div>
            )}
          </div>}
        {slideCount > 1 && <button className="carousel-arrow" onClick={() => move(1)} aria-controls="home-highlight" aria-label="Next">
          <span className="carousel-chevron" aria-hidden="true" />
        </button>}
      </div>
    </div>
    {slideCount > 1 && <div className="carousel-controls">
      <div className="carousel-dots" role="group" aria-label="Choose a highlight">
        {Array.from({ length: slideCount }, (_, slide) => <button key={slide}
          aria-label={`Show slide ${slide + 1}`} aria-current={slide === index ? 'true' : undefined}
          aria-controls="home-highlight" onClick={() => setIndex(slide)} />)}
      </div>
    </div>}
  </section>
}
