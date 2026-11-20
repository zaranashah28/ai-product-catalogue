import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import { featuredIds } from './catalogue/service'
import { createApp } from './app'
import { createMailSender } from './adapters/mail'
import type { Product } from '../../shared/catalogue'

const products: Product[] = featuredIds.map((id, index) => ({
  id, title: index === 0 ? 'Canvas Bag' : `Item ${id}`, price: 10,
  description: index === 1 ? 'Canvas trim' : 'Sample', category: 'Test Gear', image: '',
  rating: { rate: index === 0 ? 2 : 4, count: index },
}))
const sample = { name: 'Alex', email: 'alex@example.test', message: 'Bulk price?' }
const makeApp = (send = vi.fn(async () => {})) => request(createApp(async () => products, send))

describe('catalogue HTTP API', () => {
  it('returns the configured five products in order', async () => {
    const response = await makeApp().get('/api/catalogue/home').expect(200)
    expect(response.body.featured.map((p: Product) => p.id)).toEqual(featuredIds)
    expect(response.body.categories).toEqual([{ name: 'Test Gear', slug: 'test-gear', image: '/api/products/1/image' }])
  })
  it('splits ranked category products into two groups', async () => {
    const { body } = await makeApp().get('/api/categories/test-gear').expect(200)
    expect(body.featured.map((p: Product) => p.id)).toEqual([15, 9, 5])
    expect(body.additional.map((p: Product) => p.id)).toEqual([3, 1])
  })
  it('matches title and description, validates query and resolves product URLs', async () => {
    const api = makeApp()
    const { body } = await api.get('/api/products').query({ q: ' CANVAS ' }).expect(200)
    expect(body.map((p: Product) => p.id)).toEqual([1, 3])
    await api.get('/api/products').expect(400)
    await api.get('/api/products/1').expect(200)
    await api.get('/api/products/1/image').expect('Content-Type', /image\/svg/).expect(200)
    await api.get('/api/products/999').expect(404)
  })
  it('captures the configured recipient, reply address and product', async () => {
    const log = vi.spyOn(console, 'info').mockImplementation(() => {})
    try {
      const sender = createMailSender({ ENQUIRY_MODE: 'capture', SALES_EMAIL: 'sales@example.test' })
      const api = request(createApp(async () => products, sender))
      await api.post('/api/products/1/enquiries').send(sample).expect(204)
      expect(log).toHaveBeenCalledWith('Local enquiry captured:', expect.objectContaining({
        to: 'sales@example.test', replyTo: sample.email, text: expect.stringContaining('Canvas Bag (#1)'),
      }))
    } finally {
      log.mockRestore()
    }
  })
  it('rejects invalid enquiries and reports mail failure', async () => {
    const send = vi.fn(async () => { throw new Error('SMTP unavailable') })
    const api = makeApp(send)
    await api.post('/api/products/1/enquiries').send({ ...sample, email: 'invalid' }).expect(400)
    await api.post('/api/products/999/enquiries').send(sample).expect(404)
    expect(send).not.toHaveBeenCalled()
    await api.post('/api/products/1/enquiries').send(sample).expect(503)
    expect(send).toHaveBeenCalledOnce()
  })
})
