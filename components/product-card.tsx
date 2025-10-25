"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart } from "lucide-react"
import { PriceDisplay, SaleBadge } from "@/components/sale-badge"
import { useWishlist } from "@/context/wishlist"
import { QuickAddModal } from "@/components/product-modal"
import type { ShopifyProduct } from "@/lib/shopify-types"

interface ProductCardProps {
  id: string
  title: string
  price?: number
  compareAtPrice?: number
  image: string
  category?: string
  index?: number
  product?: ShopifyProduct
}

export function ProductCard({
  id,
  title,
  price = 0,
  compareAtPrice,
  image,
  category,
  index = 0,
  product
}: ProductCardProps) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const inWishlist = isInWishlist(id)
  const isPriority = index < 3
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (inWishlist) {
      removeFromWishlist(id)
    } else {
      addToWishlist({
        id,
        title,
        handle: id,
        price,
        image
      })
    }
  }

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsModalOpen(true)
  }

  return (
    <>
      <div className="group cursor-pointer">
        <Link href={`/products/${id}`}>
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

            {compareAtPrice && compareAtPrice > price && (
              <div className="absolute top-4 left-4 z-10">
                <SaleBadge
                  currentPrice={price}
                  compareAtPrice={compareAtPrice}
                  variant="small"
                />
              </div>
            )}

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

            <button
              onClick={handleQuickAdd}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-foreground text-background rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 hover:bg-foreground/90 z-10"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="text-sm font-medium">Quick Add</span>
            </button>
          </div>
        </Link>

        <div className="space-y-2">
          {category && (
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {category}
            </p>
          )}

          <div className="flex items-start justify-between gap-2">
            <Link href={`/products/${id}`}>
              <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-accent transition-colors">
                {title}
              </h3>
            </Link>

            <button
              onClick={handleQuickAdd}
              className="md:hidden p-2 hover:bg-secondary rounded-full transition-colors shrink-0"
              aria-label="Quick add to cart"
            >
              <ShoppingCart className="w-5 h-5 text-foreground" />
            </button>
          </div>

          <PriceDisplay
            currentPrice={price}
            compareAtPrice={compareAtPrice}
            showBadge={false}
          />
        </div>
      </div>

      <QuickAddModal
        productHandle={id}
        productData={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
