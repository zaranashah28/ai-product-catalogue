// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { App } from './App'
import { catalogueApi } from '@/features/catalogue/api/catalogueApi'
import { submitEnquiry } from '@/features/enquiry/api/enquiryApi'
import type { Product } from '@shared/catalogue'

vi.mock('@/features/catalogue/api/catalogueApi', () => ({
  catalogueApi: { home: vi.fn(), all: vi.fn(), category: vi.fn(), search: vi.fn(), product: vi.fn() },
}))
vi.mock('@/features/enquiry/api/enquiryApi', () => ({ submitEnquiry: vi.fn() }))

const products: Product[] = Array.from({ length: 5 }, (_, i) => ({
  id: i + 1, title: `Canvas item ${i + 1}`, description: 'Sample product', price: 20,
  image: '/sample.png', category: 'Gear', rating: { rate: 4, count: 10 },
}))
const category = { name: 'Gear', slug: 'gear' }
const accessories = { name: 'Accessories', slug: 'accessories' }
function Location() {
  const { pathname, search } = useLocation()
  return <output aria-label="Current location">{pathname}{search}</output>
}
function open(path = '/') {
  render(<MemoryRouter initialEntries={[path]}><App /><Location /></MemoryRouter>)
}

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(catalogueApi.home).mockResolvedValue({ categories: [category, accessories], featured: products })
  vi.mocked(catalogueApi.category).mockImplementation(async slug => slug === 'gear'
    ? { category, featured: products.slice(0, 3), additional: products.slice(3) }
    : { category: accessories, featured: [], additional: [] })
  vi.mocked(catalogueApi.product).mockResolvedValue(products[0])
})
afterEach(cleanup)

it('renders five featured cards, browses a category and opens a product', async () => {
  open()
  await screen.findByText('Featured products')
  expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(5)
  fireEvent.click(screen.getByRole('link', { name: 'Gear' }))
  await screen.findByText('More in this category')
  const viewport = document.scrollingElement ?? document.documentElement
  viewport.scrollTop = 500
  fireEvent.click(screen.getByRole('link', { name: /Canvas item 1/ }))
  expect(viewport.scrollTop).toBe(0)
  expect(await screen.findByRole('heading', { name: 'Canvas item 1' })).toBeTruthy()
  const breadcrumb = screen.getByRole('navigation', { name: 'Breadcrumb' })
  expect(within(breadcrumb).getByRole('link', { name: 'Catalogue' }).getAttribute('href')).toBe('/')
  expect(within(breadcrumb).getByText('Canvas item 1').getAttribute('aria-current')).toBe('page')
  const related = await screen.findByRole('region', { name: 'You might also like' })
  expect(within(related).getAllByRole('link')).toHaveLength(4)
  expect(within(related).queryByRole('link', { name: /Canvas item 1/ })).toBeNull()
  fireEvent.click(within(breadcrumb).getByRole('link', { name: 'Gear' }))
  expect(await screen.findByRole('heading', { name: 'Gear' })).toBeTruthy()
})
it('opens the full catalogue from featured products', async () => {
  const stock = Array.from({ length: 9 }, (_, index) => ({
    ...products[0], id: index + 1, title: `Full catalogue product ${index + 1}`,
  }))
  vi.mocked(catalogueApi.all).mockResolvedValue(stock)
  open()
  fireEvent.click(await screen.findByRole('link', { name: 'See all products' }))
  expect(screen.getByRole('heading', { name: 'All products' })).toBeTruthy()
  const breadcrumb = screen.getByRole('navigation', { name: 'Breadcrumb' })
  expect(within(breadcrumb).getByRole('link', { name: 'Catalogue' }).getAttribute('href')).toBe('/')
  expect(within(breadcrumb).getByText('All products').getAttribute('aria-current')).toBe('page')
  expect(screen.getByLabelText('Current location').textContent).toBe('/products')
  expect(await screen.findByText('Showing 8 of 9 products')).toBeTruthy()
  expect(screen.queryByRole('link', { name: /Full catalogue product 9/ })).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Load more' }))
  expect(screen.getByRole('link', { name: /Full catalogue product 9/ })).toBeTruthy()
  expect(screen.getByText('Showing 9 of 9 products')).toBeTruthy()
})

it('omits the category breadcrumb when opening a featured product from home', async () => {
  open()
  const featured = await screen.findByRole('region', { name: 'Featured products' })
  fireEvent.click(within(featured).getByRole('link', { name: /Canvas item 1/ }))
  const breadcrumb = screen.getByRole('navigation', { name: 'Breadcrumb' })
  await within(breadcrumb).findByText('Canvas item 1')
  expect(within(breadcrumb).getAllByRole('listitem').map(item => item.textContent))
    .toEqual(['Catalogue', 'Canvas item 1'])
})

it('browses homepage highlights and wraps back to the introduction', async () => {
  open()
  await screen.findByRole('heading', { name: /Find your next/ })
  fireEvent.click(screen.getByRole('button', { name: 'Next' }))
  expect(screen.getByRole('link', { name: 'View product' }).getAttribute('href')).toBe('/products/1')
  fireEvent.click(screen.getByRole('button', { name: 'Show slide 3' }))
  expect(screen.getByRole('heading', { name: 'Canvas item 2', level: 1 })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Next' }))
  expect(screen.getByRole('heading', { name: /Find your next/ })).toBeTruthy()
})
it('rotates automatically and pauses when hovered', async () => {
  vi.useFakeTimers()
  try {
    await act(async () => { open() })
    act(() => { vi.advanceTimersByTime(6000) })
    expect(screen.getByRole('heading', { name: 'Canvas item 1', level: 1 })).toBeTruthy()
    const carousel = screen.getByRole('region', { name: 'Featured catalogue highlights' })
    fireEvent.mouseEnter(carousel)
    act(() => { vi.advanceTimersByTime(12000) })
    expect(screen.getByRole('heading', { name: 'Canvas item 1', level: 1 })).toBeTruthy()
    fireEvent.mouseLeave(carousel)
    act(() => { vi.advanceTimersByTime(6000) })
    expect(screen.getByRole('heading', { name: 'Canvas item 2', level: 1 })).toBeTruthy()
  } finally {
    vi.useRealTimers()
  }
})
it('keeps filter chips visible, combines categories, and clears back to home', async () => {
  open()
  fireEvent.click(await screen.findByRole('link', { name: 'Gear' }))
  expect(await screen.findByRole('link', { name: 'Remove Gear filter' })).toBeTruthy()
  fireEvent.click(screen.getByRole('link', { name: 'Accessories' }))
  expect(await screen.findByRole('heading', { name: 'Gear' })).toBeTruthy()
  expect(await screen.findByRole('heading', { name: 'Accessories' })).toBeTruthy()
  expect(screen.getByLabelText('Current location').textContent).toBe('/categories/gear?category=accessories')
  fireEvent.click(screen.getByRole('link', { name: 'Remove Gear filter' }))
  expect(screen.queryByRole('heading', { name: 'Gear' })).toBeNull()
  expect(screen.getByLabelText('Current location').textContent).toBe('/categories/accessories')
  fireEvent.click(await screen.findByRole('link', { name: 'Clear filters' }))
  expect(await screen.findByRole('heading', { name: 'Featured products' })).toBeTruthy()
  expect(screen.getByLabelText('Current location').textContent).toBe('/')
})
it('submits a shareable search and handles an empty result', async () => {
  vi.mocked(catalogueApi.search).mockResolvedValue([])
  open()
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'green jacket' } })
  fireEvent.click(screen.getByRole('button', { name: 'Search' }))
  expect(await screen.findByRole('heading', { name: /No results for/ })).toBeTruthy()
  expect(screen.getByRole('link', { name: 'Browse all products' }).getAttribute('href')).toBe('/products')
  expect(screen.getByLabelText('Current location').textContent).toBe('/search?q=green+jacket')
  expect(await screen.findByRole('heading', { name: 'Explore categories' })).toBeTruthy()
  expect(screen.getByRole('link', { name: 'Gear' }).getAttribute('href')).toBe('/categories/gear')
  expect(screen.getAllByRole('link').some(link => link.getAttribute('href')?.startsWith('/products/'))).toBe(false)
  const input = screen.getByRole('searchbox')
  input.focus()
  fireEvent.change(input, { target: { value: '' } })
  expect(await screen.findByRole('heading', { name: 'Featured products' })).toBeTruthy()
  expect(screen.queryByText(/No results for/)).toBeNull()
  expect(screen.getByLabelText('Current location').textContent).toBe('/')
  expect(document.activeElement).toBe(input)
})
it('preserves details after failure and shows thanks after a successful retry', async () => {
  let reject!: (error: Error) => void
  const pending = new Promise<void>((_, fail) => { reject = fail })
  vi.mocked(submitEnquiry).mockReturnValueOnce(pending).mockResolvedValueOnce()
  open('/products/1')
  expect(screen.getByText('Loading product details…').closest('[role=status]')).toBeTruthy()
  fireEvent.click(await screen.findByRole('button', { name: 'Enquire' }))
  const breadcrumb = screen.getByRole('navigation', { name: 'Breadcrumb' })
  expect(within(breadcrumb).getAllByRole('listitem').map(item => item.textContent))
    .toEqual(['Catalogue', 'Canvas item 1'])
  const name = screen.getByLabelText<HTMLInputElement>('Name')
  const email = screen.getByLabelText<HTMLInputElement>('Email')
  expect(email.checkValidity()).toBe(false)
  fireEvent.change(name, { target: { value: 'Alex' } })
  fireEvent.change(email, { target: { value: 'alex@example.test' } })
  fireEvent.click(screen.getByRole('button', { name: 'Send enquiry' }))
  expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Sending…' }).disabled).toBe(true)
  reject(new Error('Try again later'))
  expect((await screen.findByRole('alert')).textContent).toBe('Try again later')
  expect(email.value).toBe('alex@example.test')
  fireEvent.click(screen.getByRole('button', { name: 'Send enquiry' }))
  expect(await screen.findByText('Thank you.')).toBeTruthy()
})
