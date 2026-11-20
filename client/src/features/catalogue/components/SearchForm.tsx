import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

export function SearchForm() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const submitted = params.get('q') ?? ''
  const [value, setValue] = useState(submitted)
  useEffect(() => { setValue(submitted) }, [pathname, submitted])
  return <form className="search" role="search" onSubmit={event => {
    event.preventDefault()
    const term = String(new FormData(event.currentTarget).get('q') ?? '').trim()
    navigate(term ? `/search?${new URLSearchParams({ q: term })}` : '/')
  }}>
    <label className="sr-only" htmlFor="catalogue-search">Search products</label>
    <input id="catalogue-search" name="q" type="search" value={value} placeholder="Search products" maxLength={120} onChange={event => {
      setValue(event.currentTarget.value)
      if (pathname === '/search' && params.has('q') && !event.currentTarget.value.trim()) {
        navigate('/', { replace: true })
      }
    }} />
    <button>Search</button>
  </form>
}
