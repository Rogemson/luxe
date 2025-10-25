"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart } from "lucide-react"
import { useState } from "react"
import { PriceDisplay, SaleBadge } from '@/components/sale-badge'

interface ProductCardProps {
  id: string
  title: string
  price?: number  // Make optional - could be undefined
  compareAtPrice?: number
  image: string
  category?: string
  index?: number
}

export function ProductCard({ 
  id, 
  title, 
  price = 0,  // Default to 0 if undefined
  compareAtPrice,
  image, 
  category, 
  index = 0 
}: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const isPriority = index < 3

  return (
    <Link href={`/products/${id}`}>
      <div className="group cursor-pointer">
        {/* Image Container */}
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
          
          {/* Sale Badge - Top Left */}
          {compareAtPrice && compareAtPrice > price && (
            <div className="absolute top-4 left-4 z-10">
              <SaleBadge 
                currentPrice={price}
                compareAtPrice={compareAtPrice}
                variant="small"
              />
            </div>
          )}

          {/* Wishlist Heart - Top Right */}
          <button
            onClick={(e) => {
              e.preventDefault()
              setIsFavorite(!isFavorite)
            }}
            className="absolute top-4 right-4 p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors z-10"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? "fill-accent text-accent" : "text-foreground"}`} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-2">
          {category && <p className="text-xs uppercase tracking-wide text-muted-foreground">{category}</p>}
          <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-accent transition-colors">
            {title}
          </h3>
          
          {/* Price Display with Sale Info */}
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
