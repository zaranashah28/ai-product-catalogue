// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { App } from './App'
import { catalogueApi } from '../features/catalogue/api/catalogueApi'
import { submitEnquiry } from '../features/enquiry/api/enquiryApi'
import type { Product } from '../../../shared/catalogue'

vi.mock('../features/catalogue/api/catalogueApi', () => ({
  catalogueApi: { home: vi.fn(), category: vi.fn(), search: vi.fn(), product: vi.fn() },
}))
vi.mock('../features/enquiry/api/enquiryApi', () => ({ submitEnquiry: vi.fn() }))

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
  fireEvent.click(screen.getByRole('link', { name: /Canvas item 1/ }))
  expect(await screen.findByRole('heading', { name: 'Canvas item 1' })).toBeTruthy()
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
  expect(await screen.findByText(/There are no search results/)).toBeTruthy()
  expect(screen.getByLabelText('Current location').textContent).toBe('/search?q=green+jacket')
  expect(await screen.findByRole('heading', { name: 'Explore categories' })).toBeTruthy()
  expect(screen.getByRole('link', { name: 'Gear' }).getAttribute('href')).toBe('/categories/gear')
  expect(screen.getByRole('heading', { name: 'Recommended products' })).toBeTruthy()
  const input = screen.getByRole('searchbox')
  input.focus()
  fireEvent.change(input, { target: { value: '' } })
  expect(await screen.findByRole('heading', { name: 'Featured products' })).toBeTruthy()
  expect(screen.queryByText(/There are no search results/)).toBeNull()
  expect(screen.getByLabelText('Current location').textContent).toBe('/')
  expect(document.activeElement).toBe(input)
})
it('preserves details after failure and shows thanks after a successful retry', async () => {
  let reject!: (error: Error) => void
  const pending = new Promise<void>((_, fail) => { reject = fail })
  vi.mocked(submitEnquiry).mockReturnValueOnce(pending).mockResolvedValueOnce()
  open('/products/1')
  fireEvent.click(await screen.findByRole('button', { name: 'Enquire' }))
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
