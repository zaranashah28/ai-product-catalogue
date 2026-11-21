import { useEffect, useState } from 'react'
import type { Product } from '@shared/catalogue'
import { HomeCarouselArt, HomeCarouselCopy } from './HomeCarouselSlides'

export function HomeCarousel({ featured }: { featured: Product[] }) {
  const [index, setIndex] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)
  // The introductory slide comes first, followed by up to two featured products.
  const spotlights = featured.slice(0, 2)
  const slideCount = spotlights.length + 1
  // Pause while someone is interacting with the carousel or has requested reduced motion.
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
    <div id="home-highlight" className="storefront-hero carousel-slide" data-spotlight={index > 0}
      role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${slideCount}`}
      aria-live={rotating ? 'off' : 'polite'}>
      <HomeCarouselCopy spotlights={spotlights} index={index} />
      <div className="carousel-visual">
        {slideCount > 1 && <button className="carousel-arrow" onClick={() => move(-1)} aria-controls="home-highlight" aria-label="Previous">
          <span className="carousel-chevron previous" aria-hidden="true" />
        </button>}
        <HomeCarouselArt featured={featured} spotlights={spotlights} index={index} />
        {slideCount > 1 && <button className="carousel-arrow" onClick={() => move(1)} aria-controls="home-highlight" aria-label="Next">
          <span className="carousel-chevron" aria-hidden="true" />
        </button>}
      </div>
    </div>
    <div className="carousel-controls">
      {slideCount > 1 && <div className="carousel-dots" role="group" aria-label="Choose a highlight">
        {Array.from({ length: slideCount }, (_, slide) => <button key={slide}
          aria-label={`Show slide ${slide + 1}`} aria-current={slide === index ? 'true' : undefined}
          aria-controls="home-highlight" onClick={() => setIndex(slide)} />)}
      </div>}
    </div>
  </section>
}
