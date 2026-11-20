import type { Product } from '../../../shared/catalogue'

function matchesWithOneEdit(query: string, word: string) {
  if (Math.abs(query.length - word.length) > 1) return false
  const mismatch = [...query].findIndex((character, index) => character !== word[index])
  if (mismatch === -1) return true

  // Equal-length words may differ by one replacement or one adjacent swap.
  if (query.length === word.length) {
    return query.slice(mismatch + 1) === word.slice(mismatch + 1)
      || (query[mismatch] === word[mismatch + 1]
        && query[mismatch + 1] === word[mismatch]
        && query.slice(mismatch + 2) === word.slice(mismatch + 2))
  }

  // For different lengths, skipping one character must make the remaining text match.
  const [longer, shorter] = query.length > word.length ? [query, word] : [word, query]
  return longer.slice(mismatch + 1) === shorter.slice(mismatch)
}

function words(value: string) {
  return value.match(/[a-z0-9]+/g) ?? []
}

export function searchProducts(products: Product[], term: string) {
  const textFor = (product: Product) => [product.title.toLowerCase(), product.description.toLowerCase()]
  const exact = products.filter(product => textFor(product).some(text => text.includes(term)))
  if (exact.length) return exact

  // Try typo-tolerant matching only when there are no substring matches.
  const terms = words(term)
  if (!terms.some(word => word.length >= 4)) return []

  return products.filter(product => {
    const candidates = textFor(product).flatMap(words)
    return terms.every(query => candidates.some(word =>
      query === word || (query.length >= 4 && matchesWithOneEdit(query, word))))
  })
}
