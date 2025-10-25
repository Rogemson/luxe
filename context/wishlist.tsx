'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface WishlistItem {
  id: string
  title: string
  handle: string
  price: number
  image: string
}

interface WishlistContextType {
  wishlist: WishlistItem[]
  addToWishlist: (item: WishlistItem) => void
  removeFromWishlist: (id: string) => void
  isInWishlist: (id: string) => boolean
  wishlistCount: number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [mounted, setMounted] = useState(false)

    useEffect(() => {
        const init = () => {
            setMounted(true)
            const stored = localStorage.getItem('shopify_wishlist')
            if (stored) {
            try {
                setWishlist(JSON.parse(stored))
            } catch (e) {
                console.error('Failed to parse wishlist:', e)
            }
            }
        }

        setTimeout(init, 0)
    }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('shopify_wishlist', JSON.stringify(wishlist))
    }
  }, [wishlist, mounted])

  const addToWishlist = (item: WishlistItem) => {
    setWishlist((prev) => {
      if (prev.find((i) => i.id === item.id)) {
        return prev // Already in wishlist
      }
      return [...prev, item]
    })
  }

  const removeFromWishlist = (id: string) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id))
  }

  const isInWishlist = (id: string) => {
    return wishlist.some((item) => item.id === id)
  }

  const wishlistCount = wishlist.length

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        wishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
