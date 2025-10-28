'use client'

import { useState } from 'react'
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
} from 'lucide-react'
import type { ShopifyProduct } from '@/lib/shopify-types'
import { useCart } from '@/context/cart'
import { useProductVariants } from '@/hooks/useProductVariants'
import { trackAddToCart, trackBeginCheckout } from '@/lib/ga4'
import { createShopifyCheckout } from '@/lib/shopify-client'

interface QuantitySelectorProps {
  quantity: number
  setQuantity: (quantity: number) => void
}

function QuantitySelector({ quantity, setQuantity }: QuantitySelectorProps) {
  const increment = () => setQuantity(quantity + 1)
  const decrement = () => setQuantity(Math.max(1, quantity - 1))

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={decrement}
        className="border-border"
      >
        <Minus className="w-4 h-4" />
      </Button>
      <span className="w-12 text-center font-medium">{quantity}</span>
      <Button
        variant="outline"
        size="icon"
        onClick={increment}
        className="border-border"
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  )
}

interface ProductClientPageProps {
  product: ShopifyProduct
}

export default function ProductClientPage({ product }: ProductClientPageProps) {
  const router = useRouter()
  const [isFavorite, setIsFavorite] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const { addToCart } = useCart()

  const { selectedOptions, activeVariant, handleOptionSelect, checkAvailability } =
    useProductVariants(product)

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.image].filter((img): img is string => !!img)

  const nextImage = () => setCurrentImageIndex((i) => (i + 1) % images.length)
  const prevImage = () =>
    setCurrentImageIndex((i) => (i - 1 + images.length) % images.length)

  const handleOptionChange = (optionName: string, value: string) => {
    const newVariant = handleOptionSelect(optionName, value)
    setQuantity(1)

    if (newVariant?.image) {
      const variantImageIndex = images.findIndex(
        (img) => img === newVariant.image
      )
      if (variantImageIndex !== -1) {
        setCurrentImageIndex(variantImageIndex)
      }
    }
  }

  const displayPrice = activeVariant?.price ?? product.price
  const displayOriginalPrice =
    activeVariant?.compareAtPrice ?? product.compareAtPrice
  const isAvailable = activeVariant?.availableForSale ?? false

  const handleAddToCart = () => {
    if (!activeVariant) {
      console.error('No variant selected')
      return
    }

    const variantTitle = activeVariant.selectedOptions
      .map((opt) => opt.value)
      .join(' / ')

    // Track add to cart
    trackAddToCart(
      [
        {
          item_id: activeVariant.id,
          item_name: product.title,
          item_category: product.collection || 'Product',
          item_variant: variantTitle,
          price: activeVariant.price,
          quantity: quantity,
        },
      ],
      activeVariant.price * quantity
    )

    addToCart({
      variantId: activeVariant.id,
      merchandiseId: activeVariant.id,
      quantity: quantity,
      title: product.title,
      handle: product.handle,
      image: activeVariant.image || product.image,
      price: activeVariant.price,
      variantTitle: variantTitle,
    })

    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 1000)
  }

  const handleBuyNow = async () => {
    if (!activeVariant) {
      console.error('No variant selected')
      return
    }

    setIsProcessing(true)

    try {
      const variantTitle = activeVariant.selectedOptions
        .map((opt) => opt.value)
        .join(' / ')

      // Track begin checkout
      trackBeginCheckout(
        [
          {
            item_id: activeVariant.id,
            item_name: product.title,
            item_category: product.collection || 'Product',
            item_variant: variantTitle,
            price: activeVariant.price,
            quantity: quantity,
          },
        ],
        activeVariant.price * quantity
      )

      const lines = [
        {
          merchandiseId: activeVariant.id,
          quantity: quantity,
        },
      ]

      const checkoutUrl = await createShopifyCheckout(lines)
      window.location.href = checkoutUrl
    } catch (error) {
      console.error('Checkout error:', error)
      setIsProcessing(false)
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
              onClick={() => router.push('/products')}
              className="mb-8 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Products
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
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-background/80 rounded-full hover:bg-background"
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
                        ? 'border-accent'
                        : 'border-border'
                    }`}
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
                          onClick={() => handleOptionChange(option.name, value)}
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

            <div className="pt-4">
              <p className="font-medium mb-2">Quantity</p>
              <QuantitySelector
                quantity={quantity}
                setQuantity={setQuantity}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                className={`flex-1 transition-all cursor-pointer ${
                  !isAvailable
                    ? 'bg-secondary text-muted-foreground cursor-not-allowed'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
                disabled={!isAvailable}
                onClick={handleAddToCart}
              >
                {addedToCart
                  ? 'Added to cart!'
                  : isAvailable
                  ? 'Add to Cart'
                  : activeVariant
                  ? 'Unavailable'
                  : 'Out of Stock'}
              </Button>

              <Button
                className={`flex-1 transition-all cursor-pointer ${
                  !isAvailable || isProcessing
                    ? 'bg-secondary text-muted-foreground cursor-not-allowed'
                    : 'bg-foreground text-background hover:bg-foreground/90'
                }`}
                disabled={!isAvailable || isProcessing}
                onClick={handleBuyNow}
              >
                {isProcessing ? 'Processing...' : 'Buy Now'}
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsFavorite(!isFavorite)}
                className="border-border hover:bg-secondary"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isFavorite
                      ? 'fill-accent text-accent'
                      : 'text-foreground'
                  }`}
                />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="border-border hover:bg-secondary"
              >
                <Share2 className="w-5 h-5 text-foreground" />
              </Button>
            </div>

            {!activeVariant && product.variants.length > 0 && (
              <p className="text-sm text-destructive text-center">
                This combination is not available.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
