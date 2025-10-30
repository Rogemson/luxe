'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { PriceDisplay } from '@/components/sale-badge'
import {
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  PackageX,
  AlertTriangle,
  Loader2
} from 'lucide-react'
import type { ShopifyProduct } from '@/lib/shopify-types'
import { useCart } from '@/context/cart'
import { useProductVariants } from '@/hooks/useProductVariants'
import { trackAddToCart, trackBeginCheckout } from '@/lib/ga4'
import { createShopifyCheckout, getVariantInventory  } from '@/lib/shopify-client'
import { toast } from 'sonner'

interface QuantitySelectorProps {
  quantity: number
  setQuantity: (quantity: number) => void
  max: number | null
  disabled?: boolean
}

function QuantitySelector({
  quantity,
  setQuantity,
  max,
  disabled,
}: QuantitySelectorProps) {
  const increment = () => {
    if (max === null) {
      setQuantity(quantity + 1)
    } else {
      setQuantity(Math.min(max, quantity + 1))
    }
  }

  const decrement = () => setQuantity(Math.max(1, quantity - 1))

  const isIncrementDisabled = disabled || (max !== null && quantity >= max)

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="icon"
        onClick={decrement}
        disabled={disabled || quantity <= 1}
        className="h-10 w-10"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
      <Button
        variant="outline"
        size="icon"
        onClick={increment}
        disabled={isIncrementDisabled}
        className="h-10 w-10"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default function ProductClientPage({
  product,
}: {
  product: ShopifyProduct
}) {
  const router = useRouter()
  const { addToCart } = useCart()
  const {
    selectedOptions,
    activeVariant,
    handleOptionSelect,
    checkAvailability,
  } = useProductVariants(product)

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isBuyingNow, setIsBuyingNow] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [liveStockData, setLiveStockData] = useState<Record<string, { availableForSale: boolean, quantityAvailable: number | null }>>({})
  const [isLoadingStock, setIsLoadingStock] = useState(false)

  // ✅ OPTIMIZED: Only fetch live stock when user interacts with quantity or tries to add to cart
  const fetchLiveStock = useCallback(async (variantId: string) => {
    if (liveStockData[variantId]) return // Already fetched
    
    setIsLoadingStock(true)
    try {
      const inventory = await getVariantInventory(variantId)
      if (inventory) {
        setLiveStockData(prev => ({
          ...prev,
          [variantId]: {
            availableForSale: inventory.availableForSale,
            quantityAvailable: inventory.quantityAvailable,
          }
        }))
      }
    } catch (error) {
      console.error('Failed to fetch live stock:', error)
    } finally {
      setIsLoadingStock(false)
    }
  }, [liveStockData])

  // ✅ OPTIMIZED: Only fetch stock when variant changes AND user is about to interact
  useEffect(() => {
    if (!activeVariant) return
    
    // ✅ Use cached stock data first (from SSR/ISR)
    const cachedStock = activeVariant.quantityAvailable
    
    // ✅ Only fetch live if stock is low or out
    if (cachedStock !== null && cachedStock <= 10) {
      // Defer fetching until user shows intent to purchase
      const timer = setTimeout(() => {
        fetchLiveStock(activeVariant.id)
      }, 1000) // Wait 1s before fetching
      
      return () => clearTimeout(timer)
    }
  }, [activeVariant?.id, fetchLiveStock])

  const currentVariantStock = activeVariant && liveStockData[activeVariant.id]
    ? liveStockData[activeVariant.id]
    : activeVariant
      ? { 
          availableForSale: activeVariant.availableForSale, 
          quantityAvailable: activeVariant.quantityAvailable 
        }
      : null

  // Get images for the gallery
  const images = useMemo(() => {
    const mainImage = activeVariant?.image || product.image
    const otherImages = product.images.filter((img) => img !== mainImage)
    return [mainImage, ...otherImages].filter(Boolean) as string[]
  }, [product.image, product.images, activeVariant?.image])

  // Get stock info for active variant
  const maxQuantity = currentVariantStock?.quantityAvailable ?? null
  const isOutOfStock = currentVariantStock ? !currentVariantStock.availableForSale : false
  const showLowStock =
    (currentVariantStock?.quantityAvailable ?? 0) <= 10 &&
    (currentVariantStock?.quantityAvailable ?? 0) > 0

  // Get price display
  const displayPrice = activeVariant?.price ?? product.price
  const displayOriginalPrice =
    activeVariant?.compareAtPrice ?? product.compareAtPrice

  // Image gallery functions
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  // Update main image when variant changes
  useEffect(() => {
    if (activeVariant?.image) {
      const newIndex = images.findIndex((img) => img === activeVariant.image)
      if (newIndex !== -1) {
        setCurrentImageIndex(newIndex)
      }
    }
  }, [activeVariant?.image, images])

  // Reset quantity when variant changes and new max is lower
  useEffect(() => {
    if (maxQuantity !== null && quantity > maxQuantity) {
      setQuantity(Math.max(1, maxQuantity))
    }
  }, [maxQuantity, quantity])

  const handleAddToCart = async () => {
    if (!activeVariant) {
      toast.error('Please select all options')
      return
    }

    // ✅ Fetch fresh stock before adding to cart
    if (!liveStockData[activeVariant.id]) {
      await fetchLiveStock(activeVariant.id)
    }

    if (isOutOfStock) {
      toast.error('This item is out of stock')
      return
    }

    if (maxQuantity !== null && quantity > maxQuantity) {
      toast.error('Quantity exceeds available stock', {
        description: `Only ${maxQuantity} available`,
      })
      return
    }

    setIsAddingToCart(true)

    try {
      const variantTitle = activeVariant.selectedOptions
        .map((opt) => opt.value)
        .join(' / ')

      await addToCart({
        variantId: activeVariant.id,
        merchandiseId: activeVariant.id,
        quantity,
        title: product.title,
        handle: product.handle,
        image: activeVariant.image || product.image,
        price: activeVariant.price,
        variantTitle: variantTitle,
        availableForSale: activeVariant.availableForSale,
        quantityAvailable: activeVariant.quantityAvailable,
        productTitle: product.title,
      })

      trackAddToCart(
        [
          {
            item_id: activeVariant.id,
            item_name: product.title,
            item_variant: variantTitle,
            price: activeVariant.price,
            quantity,
          },
        ],
        activeVariant.price * quantity
      )
    } catch (error) {
      console.error('Add to cart error:', error)
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleBuyNow = async () => {
    if (!activeVariant) {
      toast.error('Please select all options')
      return
    }

    // ✅ Fetch fresh stock before checkout
    if (!liveStockData[activeVariant.id]) {
      await fetchLiveStock(activeVariant.id)
    }

    if (isOutOfStock) {
      toast.error('This item is out of stock')
      return
    }

    if (maxQuantity !== null && quantity > maxQuantity) {
      toast.error('Quantity exceeds available stock', {
        description: `Only ${maxQuantity} available`,
      })
      return
    }

    setIsBuyingNow(true)

    try {
      const lines = [
        {
          merchandiseId: activeVariant.id,
          quantity,
        },
      ]

      const variantTitle = activeVariant.selectedOptions
        .map((opt) => opt.value)
        .join(' / ')

      trackBeginCheckout(
        [
          {
            item_id: activeVariant.id,
            item_name: product.title,
            item_variant: variantTitle,
            price: activeVariant.price,
            quantity,
          },
        ],
        activeVariant.price * quantity
      )

      toast.loading('Preparing checkout...', {
        id: 'buy-now-loading',
      })

      const checkoutUrl = await createShopifyCheckout(lines)

      toast.dismiss('buy-now-loading')
      window.location.assign(checkoutUrl) // ✅ Fixed immutability warning
    } catch (error) {
      console.error('Buy now error:', error)

      toast.dismiss('buy-now-loading')

      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        toast.error('Connection problem', {
          description: 'Could not reach checkout. Please check your internet.',
        })
      } else {
        toast.error('Checkout failed', {
          description: 'Please try adding to cart instead.',
        })
      }

      setIsBuyingNow(false)
    }
  }

  return (
    <main className="bg-background">
      <Header />
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-8 text-muted-foreground hover:text-foreground cursor-pointer -ml-4"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary">
              {images[currentImageIndex] ? (
                <Image
                  src={images[currentImageIndex]}
                  alt={product.title || 'Product image'}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="w-full aspect-square bg-gray-100 flex items-center justify-center rounded-lg">
                  <span className="text-gray-500 text-sm">
                    No image available
                  </span>
                </div>
              )}

              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-background/80 rounded-full hover:bg-background"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-background/80 rounded-full hover:bg-background"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`relative w-20 h-20 rounded-md overflow-hidden border-2 ${
                      currentImageIndex === i
                        ? 'border-primary'
                        : 'border-border'
                    }`}
                    aria-label={`View image ${i + 1}`}
                  >
                    {img ? (
                      <Image
                        src={img}
                        alt={`${product.title || 'Product'} thumbnail ${i + 1}`}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-md">
                        <span className="text-gray-400 text-xs">No image</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm uppercase tracking-wide text-muted-foreground mb-2">
                {product.collection || 'Product'}
              </p>
              <h1 className="font-serif text-4xl font-semibold text-foreground">
                {product.title}
              </h1>

              <div className="mt-4">
                <PriceDisplay
                  currentPrice={displayPrice}
                  compareAtPrice={displayOriginalPrice}
                  showBadge={true}
                />
              </div>
            </div>

            {isLoadingStock ? (
                <div className="flex items-center gap-2 bg-muted border rounded-lg px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Checking availability...</span>
                </div>
              ) : isOutOfStock ? (
                <div className="flex items-center gap-2 text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3">
                  <PackageX className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">Out of Stock</p>
                    <p className="text-xs">This variant is currently unavailable</p>
                  </div>
                </div>
              ) : showLowStock && maxQuantity !== null && (
                <div className="flex items-center gap-2 text-warning bg-warning/10 border border-warning/30 rounded-lg px-4 py-3">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">Low Stock</p>
                    <p className="text-xs">Only {maxQuantity} left in stock</p>
                  </div>
                </div>
              )}

            <p className="text-foreground/70 leading-relaxed">
              {product.description}
            </p>

            {/* VARIANT SELECTION */}
            <div className="space-y-4">
              {product.options.map((option) => (
                <div key={option.id}>
                  <p className="font-medium mb-2">{option.name}</p>
                  <div className="flex flex-wrap gap-2">
                    {option.values.map((value) => {
                      const isSelected = selectedOptions[option.name] === value
                      const isOptionAvailable = checkAvailability(
                        option.name,
                        value
                      )

                      return (
                        <button
                          key={value}
                          onClick={() => handleOptionSelect(option.name, value)}
                          disabled={!isOptionAvailable}
                          className={`px-4 py-2 border rounded-md text-sm font-medium transition ${
                            isSelected
                              ? 'bg-foreground text-background border-foreground'
                              : isOptionAvailable
                              ? 'border-border hover:border-foreground'
                              : 'border-border text-muted-foreground line-through cursor-not-allowed opacity-60'
                          }`}
                        >
                          {value}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity</label>
              <QuantitySelector
                quantity={quantity}
                setQuantity={setQuantity}
                max={maxQuantity}
                disabled={isOutOfStock || !activeVariant}
              />
              {maxQuantity !== null && !isOutOfStock && (
                <p className="text-xs text-muted-foreground">
                  Maximum available: {maxQuantity}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleAddToCart}
                disabled={
                  !activeVariant ||
                  isAddingToCart ||
                  isBuyingNow ||
                  isOutOfStock
                }
                className="w-full"
                size="lg"
              >
                {isAddingToCart
                  ? 'Adding...'
                  : isOutOfStock
                  ? 'Out of Stock'
                  : 'Add to Cart'}
              </Button>
              <Button
                onClick={handleBuyNow}
                disabled={
                  !activeVariant ||
                  isBuyingNow ||
                  isAddingToCart ||
                  isOutOfStock
                }
                variant="outline"
                className="w-full"
                size="lg"
              >
                {isBuyingNow ? 'Processing...' : 'Buy Now'}
              </Button>
            </div>

            {/* Unavailable variant message */}
            {!activeVariant &&
              product.options.some((opt) => !selectedOptions[opt.name]) && (
                <div className="bg-muted border rounded-lg p-4 text-sm text-muted-foreground text-center">
                  Please select all options to see availability.
                </div>
              )}

            {!activeVariant &&
              product.options.every((opt) => selectedOptions[opt.name]) && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-sm text-destructive text-center">
                  This combination is not available.
                </div>
              )}

            {/* Share/Favorite */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsFavorite(!isFavorite)}
                className="border-border hover:bg-secondary"
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${
                    isFavorite
                      ? 'fill-red-500 text-red-500'
                      : 'text-foreground'
                  }`}
                />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="border-border hover:bg-secondary"
                aria-label="Share product"
              >
                <Share2 className="w-5 h-5 text-foreground" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}