'use client'

import { useEffect, useState } from 'react'
import { ProductCard } from '@/components/product-card'
import { ShopifyProduct } from '@/lib/shopify-types'
import { getProducts } from '@/lib/shopify-client'

interface RelatedProductsProps {
  currentProductId: string
  collection?: string
}

export function RelatedProducts({ currentProductId, collection }: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<ShopifyProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const allProducts = await getProducts(20)
        
        // Filter out current product
        const otherProducts = allProducts.filter(p => p.id !== currentProductId)
        
        // Get products from same collection first
        let related = collection 
          ? otherProducts.filter(p => p.collection === collection)
          : []
        
        // If not enough from collection, add random products
        if (related.length < 4) {
          const remaining = otherProducts.filter(p => !related.includes(p))
          related = [...related, ...remaining].slice(0, 4)
        } else {
          related = related.slice(0, 4)
        }
        
        setRelatedProducts(related)
      } catch (error) {
        console.error('Failed to fetch related products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRelated()
  }, [currentProductId, collection])

  if (loading) {
    return (
      <section className="py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-2xl font-semibold mb-8">You Might Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-muted rounded-lg mb-4" />
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (relatedProducts.length === 0) return null

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-serif text-2xl font-semibold mb-8">You Might Also Like</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {relatedProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              id={product.handle}
              title={product.title}
              price={product.price}
              compareAtPrice={product.compareAtPrice}
              image={product.image}
              category={product.category}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
