'use client'

import { useEffect } from 'react'
import { useSearch } from '@/context/search'
import { getProducts } from '@/lib/shopify-client'

export function ProductsLoader() {
  const { setProducts } = useSearch()

  useEffect(() => {
    let isMounted = true

    const loadProducts = async () => {
      try {
        const data = await getProducts(100) // Fetch products for global search
        if (isMounted) {
          setProducts(data)
        }
      } catch (error) {
        console.error('Failed to load products for search:', error)
      }
    }

    loadProducts()

    return () => {
      isMounted = false
    }
  }, [setProducts])

  return null // This component doesn't render anything
}
