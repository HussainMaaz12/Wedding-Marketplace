'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface Category {
  _id: string
  name: string
  slug: string
  icon: string
}

const INDIAN_CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Udaipur', 'Jaipur', 'Goa', 'Chennai', 'Pune']

export default function VendorFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [categories, setCategories] = useState<Category[]>([])
  
  // Local state for UI inputs before applying
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [city, setCity] = useState(searchParams.get('city') || '')
  const [sort, setSort] = useState(searchParams.get('sort') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.data) setCategories(data.data)
      })
      .catch(() => {})
  }, [])

  // Update URL search params
  const applyFilters = () => {
    const params = new URLSearchParams()
    
    if (searchTerm.trim()) params.set('search', searchTerm.trim())
    if (category) params.set('category', category)
    if (city) params.set('city', city)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    if (sort) params.set('sort', sort)

    router.push(`/vendors?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setCategory('')
    setCity('')
    setMinPrice('')
    setMaxPrice('')
    setSort('')
    router.push('/vendors')
  }

  // Handle enter key on search input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') applyFilters()
  }

  return (
    <div className="bg-white rounded-2xl border border-[var(--cream-dkr)] p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-[var(--font-display)] text-xl text-[var(--charcoal)]">Filters</h2>
        <button 
          onClick={clearFilters}
          className="text-xs font-semibold tracking-wider uppercase text-[var(--text-muted)] hover:text-[var(--burgundy)] transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-6">
        
        {/* Search */}
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-[var(--text-light)] mb-2">
            Search
          </label>
          <div className="relative">
            <input 
              type="text" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Business name..." 
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-[var(--cream)] border border-[var(--cream-dkr)] rounded-lg focus:border-[var(--gold)] outline-none transition-colors"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">🔍</span>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-[var(--text-light)] mb-2">
            Category
          </label>
          <select 
            value={category}
            onChange={e => { setCategory(e.target.value); setTimeout(applyFilters, 100) }}
            className="w-full px-4 py-2.5 text-sm bg-[var(--cream)] border border-[var(--cream-dkr)] rounded-lg focus:border-[var(--gold)] outline-none appearance-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* City */}
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-[var(--text-light)] mb-2">
            City
          </label>
          <select 
            value={city}
            onChange={e => { setCity(e.target.value); setTimeout(applyFilters, 100) }}
            className="w-full px-4 py-2.5 text-sm bg-[var(--cream)] border border-[var(--cream-dkr)] rounded-lg focus:border-[var(--gold)] outline-none appearance-none cursor-pointer"
          >
            <option value="">All Cities</option>
            {INDIAN_CITIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase text-[var(--text-light)] mb-2">
            Sort By
          </label>
          <select 
            value={sort}
            onChange={e => { setSort(e.target.value); setTimeout(applyFilters, 100) }}
            className="w-full px-4 py-2.5 text-sm bg-[var(--cream)] border border-[var(--cream-dkr)] rounded-lg focus:border-[var(--gold)] outline-none appearance-none cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="rating">Highest Rated</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
        
        {/* Apply Button (mainly for desktop when they type search terms) */}
        <button 
          onClick={applyFilters}
          className="w-full py-3 bg-[var(--burgundy)] text-white text-xs font-bold tracking-widest uppercase rounded-lg hover:bg-[var(--burgundy-dk)] transition-colors mt-2"
        >
          Apply Filters
        </button>
      </div>
    </div>
  )
}
