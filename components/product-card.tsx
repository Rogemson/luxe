"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart } from "lucide-react"
import { PriceDisplay, SaleBadge } from '@/components/sale-badge'
import { useWishlist } from '@/context/wishlist'  // Add this

interface ProductCardProps {
  id: string
  title: string
  price?: number
  compareAtPrice?: number
  image: string
  category?: string
  index?: number
}

export function ProductCard({ 
  id, 
  title, 
  price = 0,
  compareAtPrice,
  image, 
  category, 
  index = 0 
}: ProductCardProps) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()  // Add this
  const inWishlist = isInWishlist(id)  // Add this
  const isPriority = index < 3

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (inWishlist) {
      removeFromWishlist(id)
    } else {
      addToWishlist({
        id,
        title,
        handle: id,  // You might want to pass actual handle
        price,
        image,
      })
    }
  }

  return (
    <Link href={`/products/${id}`}>
      <div className="group cursor-pointer">
        <div className="relative overflow-hidden bg-secondary mb-4 aspect-square">
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading={isPriority ? "eager" : "lazy"}
            priority={isPriority}
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Sale Badge */}
          {compareAtPrice && compareAtPrice > price && (
            <div className="absolute top-4 left-4 z-10">
              <SaleBadge 
                currentPrice={price}
                compareAtPrice={compareAtPrice}
                variant="small"
              />
            </div>
          )}

          {/* Wishlist Heart - NOW FUNCTIONAL */}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-4 right-4 p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors z-10"
          >
            <Heart 
              className={`w-5 h-5 transition-colors ${
                inWishlist 
                  ? "fill-red-500 text-red-500" 
                  : "text-foreground hover:text-red-500"
              }`} 
            />
          </button>
        </div>

        <div className="space-y-2">
          {category && <p className="text-xs uppercase tracking-wide text-muted-foreground">{category}</p>}
          <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-accent transition-colors">
            {title}
          </h3>
          <PriceDisplay
            currentPrice={price}
            compareAtPrice={compareAtPrice}
            showBadge={false}
          />
        </div>
      </div>
    </Link>
  )
}
