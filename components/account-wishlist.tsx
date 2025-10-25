'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WishlistItem {
  id: string
  name: string
  price: number
  image: string
}

interface WishlistApiResponse {
  wishlist?: WishlistItem[]
  error?: string
}

export function AccountWishlist() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const token = localStorage.getItem('shopifyCustomerToken')

        if (!token) {
          setWishlistItems([])
          setLoading(false)
          return
        }

        console.log('❤️ [WISHLIST] Fetching wishlist...')

        const response = await fetch('/api/auth/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        })

        const data: WishlistApiResponse = await response.json()

        if (response.ok && data.wishlist) {
          setWishlistItems(data.wishlist)
          console.log('✅ [WISHLIST] Loaded:', data.wishlist.length, 'items')
        } else {
          console.error('❌ [WISHLIST] Error:', data.error)
          setWishlistItems([])
        }
      } catch (error) {
        console.error('❌ [WISHLIST] Exception:', error)
        setWishlistItems([])
      } finally {
        setLoading(false)
      }
    }

    fetchWishlist()
  }, [])

  const handleRemoveFromWishlist = async (itemId: string) => {
    try {
      const token = localStorage.getItem('shopifyCustomerToken')

      if (!token) return

      console.log('❤️ [WISHLIST] Removing item...')

      const response = await fetch('/api/auth/wishlist/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, itemId })
      })

      if (response.ok) {
        setWishlistItems(wishlistItems.filter((item) => item.id !== itemId))
        console.log('✅ [WISHLIST] Item removed')
      }
    } catch (error) {
      console.error('❌ [WISHLIST] Failed to remove item:', error)
    }
  }

  if (loading) {
    return <div className="p-6">Loading wishlist...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground mb-2">Wishlist</h2>
        <p className="text-muted-foreground">Your saved items for later</p>
      </div>

      {wishlistItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="bg-card border border-border rounded-lg overflow-hidden hover:border-accent hover:shadow-md transition-all duration-200"
            >
              <div className="aspect-square bg-muted relative overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={() => handleRemoveFromWishlist(item.id)}
                  className="absolute top-4 right-4 p-2 bg-background rounded-full hover:bg-secondary transition-colors shadow-md"
                >
                  <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                </button>
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="font-serif font-semibold text-foreground mb-2 line-clamp-2">{item.name}</h3>
                <div className="flex items-center justify-between gap-4">
                  <p className="font-serif text-lg font-semibold text-foreground">${item.price.toFixed(2)}</p>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-foreground font-semibold text-lg mb-2">Your wishlist is empty</p>
          <p className="text-muted-foreground mb-6">Add items to your wishlist to save them for later</p>
          <Button>Start Shopping</Button>
        </div>
      )}
    </div>
  )
}