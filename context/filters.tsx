'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { ShopifyProduct } from '@/lib/shopify-types'

interface FilterState {
  priceRange: [number, number]
  categories: string[]
  inStock: boolean | null
  sortBy: 'price-asc' | 'price-desc' | 'newest' | 'popular'
}

interface FiltersContextType {
  filters: FilterState
  setFilters: (filters: FilterState) => void
  resetFilters: () => void
  applyFilters: (products: ShopifyProduct[]) => ShopifyProduct[]
}

const defaultFilters: FilterState = {
  priceRange: [0, 1000],
  categories: [],
  inStock: null,
  sortBy: 'newest',
}

const FiltersContext = createContext<FiltersContextType | undefined>(undefined)

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters)

  const resetFilters = () => {
    setFilters(defaultFilters)
  }

  const applyFilters = (products: ShopifyProduct[]): ShopifyProduct[] => {
    let filtered = [...products]

    // Filter by price range
    filtered = filtered.filter(
      (product) =>
        product.price >= filters.priceRange[0] &&
        product.price <= filters.priceRange[1]
    )

    // Filter by categories
    if (filters.categories.length > 0) {
      filtered = filtered.filter((product) =>
        filters.categories.includes(product.category)
      )
    }

    // Filter by stock
    if (filters.inStock !== null) {
      filtered = filtered.filter(
        (product) => product.availableForSale === filters.inStock
      )
    }

    // Sort
    switch (filters.sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'newest':
        // Assuming products are already ordered by newest from Shopify
        break
      case 'popular':
        // Could implement view count tracking later
        break
    }

    return filtered
  }

  return (
    <FiltersContext.Provider
      value={{
        filters,
        setFilters,
        resetFilters,
        applyFilters,
      }}
    >
      {children}
    </FiltersContext.Provider>
  )
}

export function useFilters() {
  const context = useContext(FiltersContext)
  if (context === undefined) {
    throw new Error('useFilters must be used within a FiltersProvider')
  }
  return context
}
