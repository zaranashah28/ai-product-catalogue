import { axiosClient } from '../../../api/axiosClient'
import type { CategoryData, HomeData, Product } from '../../../../../shared/catalogue'

export const catalogueApi = {
  home: (signal: AbortSignal) => axiosClient.get<HomeData>('/catalogue/home', { signal }).then(res => res.data),
  category: (slug: string, signal: AbortSignal) => axiosClient.get<CategoryData>(`/categories/${encodeURIComponent(slug)}`, { signal }).then(res => res.data),
  search: (q: string, signal: AbortSignal) => axiosClient.get<Product[]>('/products', { params: { q }, signal }).then(res => res.data),
  product: (id: string, signal: AbortSignal) => axiosClient.get<Product>(`/products/${encodeURIComponent(id)}`, { signal }).then(res => res.data),
}
