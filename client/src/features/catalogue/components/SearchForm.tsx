import { useNavigate, useSearchParams } from 'react-router-dom'

export function SearchForm() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  return <form className="search" role="search" onSubmit={event => {
    event.preventDefault()
    const term = String(new FormData(event.currentTarget).get('q') ?? '').trim()
    navigate(term ? `/search?${new URLSearchParams({ q: term })}` : '/search')
  }}>
    <label className="sr-only" htmlFor="catalogue-search">Search products</label>
    <input id="catalogue-search" name="q" type="search" key={params.get('q')} defaultValue={params.get('q') ?? ''} placeholder="Search products" maxLength={120} />
    <button>Search</button>
  </form>
}
