'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'  // Add this import
import { Search, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { ShopifyProduct } from '@/lib/shopify-types'

interface SearchModalProps {
  products: ShopifyProduct[]
  isOpen: boolean
  onClose: () => void
}

export function SearchModal({ products, isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()  // Add this

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
        setTimeout(() => {
        setSearchQuery('')
        setSelectedIndex(0)
        }, 0)
    }
    }, [isOpen])

  // Fast client-side search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []

    const query = searchQuery.toLowerCase()
    
    return products
      .filter((product) => {
        return (
          product.title.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          product.handle.toLowerCase().includes(query)
        )
      })
      .slice(0, 8)
  }, [searchQuery, products])

  // Get latest 6 products (when search is empty)
  const latestProducts = useMemo(() => {
    return products.slice(0, 6)
  }, [products])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        const results = searchQuery.trim() ? searchResults : latestProducts
        setSelectedIndex((prev) => 
          prev < results.length - 1 ? prev + 1 : prev
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0))
      } else if (e.key === 'Enter') {
        const results = searchQuery.trim() ? searchResults : latestProducts
        if (results[selectedIndex]) {
          onClose()  // Close modal first
          router.push(`/products/${results[selectedIndex].handle}`)  // Use Next.js router
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, searchResults, latestProducts, selectedIndex, searchQuery, router])

  // Close on outside click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  const displayProducts = searchQuery.trim() ? searchResults : latestProducts

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
      onClick={handleBackdropClick}
    >
      <div className="bg-background border border-border rounded-lg shadow-lg w-full max-w-2xl mx-4 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setSelectedIndex(0)
            }}
            autoFocus
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
          />
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Search Results or Latest Products */}
        <div className="max-h-[500px] overflow-y-auto">
          {displayProducts.length > 0 ? (
            <>
              {/* Header text */}
              {!searchQuery.trim() && (
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm text-muted-foreground font-medium">Latest Products</p>
                </div>
              )}
              
              <div className="divide-y divide-border">
                {displayProducts.map((product, index) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.handle}`}
                    onClick={onClose}
                    className={`flex items-center gap-4 p-4 hover:bg-secondary transition-colors ${
                      index === selectedIndex ? 'bg-secondary' : ''
                    }`}
                  >
                    <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0">
                      <Image
                        src={product.image || '/placeholder.svg'}
                        alt={product.title}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">
                        {product.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {product.category}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-foreground">
                        ${product.price.toFixed(2)}
                      </p>
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <p className="text-xs text-muted-foreground line-through">
                          ${product.compareAtPrice.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : searchQuery.trim() ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No products found for &quot;{searchQuery}&quot;</p>
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No products available</p>
            </div>
          )}
        </div>

        {/* Footer hint */}
        {displayProducts.length > 0 && (
          <div className="px-4 py-2 bg-muted border-t border-border text-xs text-muted-foreground flex items-center justify-between">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
            <span>ESC to close</span>
          </div>
        )}
      </div>
    </div>
  )
}
