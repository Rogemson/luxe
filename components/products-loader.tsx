'use client'

import { useEffect, useState } from 'react'
import { useSearch } from '@/context/search'
import { getProducts } from '@/lib/shopify-client'
import { AlertCircle } from 'lucide-react'

export function ProductsLoader() {
  const { setProducts } = useSearch()
  const [error, setError] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadProducts = async () => {
      try {
        setError(null)
        const data = await getProducts(100)
        if (isMounted) {
          setProducts(data)
        }
      } catch (error) {
        console.error('❌ Error fetching all products:', error)
        
        if (isMounted) {
          if (error instanceof TypeError && error.message === 'Failed to fetch') {
            setError('Unable to load products. Please check your connection.')
          } else {
            setError('Failed to load products. Please try again.')
          }
        }
      }
    }

    loadProducts()

    return () => {
      isMounted = false
    }
  }, [setProducts])

  const handleRetry = () => {
    setIsRetrying(true)
    setError(null)
    
    getProducts(100)
      .then(data => setProducts(data))
      .catch(err => {
        console.error('Retry failed:', err)
        if (err instanceof TypeError && err.message === 'Failed to fetch') {
          setError('Unable to load products. Please check your connection.')
        } else {
          setError('Failed to load products. Please try again.')
        }
      })
      .finally(() => setIsRetrying(false))
  }

  // ✅ RENDER ERROR UI
  if (error) {
    return (
      <div className="fixed bottom-4 right-4 max-w-sm bg-card border border-destructive/20 rounded-lg p-4 shadow-lg z-50">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <p className="text-sm font-medium">Product Search Unavailable</p>
            <p className="text-xs text-muted-foreground">{error}</p>
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="text-xs text-primary hover:underline disabled:opacity-50"
            >
              {isRetrying ? 'Retrying...' : 'Try again'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
