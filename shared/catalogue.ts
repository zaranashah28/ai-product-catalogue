export interface Product {
  id: number
  title: string
  description: string
  price: number
  category: string
  image: string
  rating: { rate: number; count: number }
}

export interface Category { name: string; slug: string; image?: string }
export interface HomeData { featured: Product[]; categories: Category[] }
export interface CategoryData { category: Category; featured: Product[]; additional: Product[] }
export interface Enquiry { name: string; email: string; message?: string }
export interface ApiError { message: string; fields?: Record<string, string> }
