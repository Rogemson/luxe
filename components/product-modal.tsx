'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { X, Minus, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PriceDisplay } from '@/components/sale-badge'
import { useCart } from '@/context/cart'
import { createShopifyCheckout, getProductByHandle } from '@/lib/shopify-client'
import { useProductVariants } from '@/hooks/useProductVariants'
import { trackAddToCart, trackBeginCheckout } from '@/lib/ga4'
import type { ShopifyProduct } from '@/lib/shopify-types'

interface QuickAddModalProps {
  productHandle: string
  productData?: ShopifyProduct
  isOpen: boolean
  onClose: () => void
}

export function QuickAddModal({
  productHandle,
  productData,
  isOpen,
  onClose,
}: QuickAddModalProps) {
  const { addToCart } = useCart()
  const [product, setProduct] = useState(productData || null)
  const [loading, setLoading] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const { selectedOptions, activeVariant, handleOptionSelect, checkAvailability } =
    useProductVariants(product)

  useEffect(() => {
    if (!isOpen) return

    Promise.resolve().then(() => {
      if (productData && productData.variants?.length > 0) {
        setProduct(productData)
        return
      }

      setLoading(true)
      setProduct(null)

      getProductByHandle(productHandle)
        .then((fetchedProduct) => {
          if (fetchedProduct) {
            setProduct(fetchedProduct)
          }
          setLoading(false)
        })
        .catch(() => setLoading(false))

      setQuantity(1)
      setAddedToCart(false)
    })
  }, [isOpen, productHandle, productData])

  const handleAddToCart = () => {
    if (!activeVariant || !product) return

    const variantTitle = activeVariant.selectedOptions.map((opt) => opt.value).join(' / ')

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
    setTimeout(() => {
      setAddedToCart(false)
      onClose()
    }, 1000)
  }

  const handleBuyNow = async () => {
    if (!activeVariant) return

    setIsProcessing(true)
    try {
      const variantTitle = activeVariant.selectedOptions.map((opt) => opt.value).join(' / ')

      // Track begin checkout
      trackBeginCheckout(
        [
          {
            item_id: activeVariant.id,
            item_name: product?.title || '',
            item_category: product?.collection || 'Product',
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
    } catch {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  const displayPrice = activeVariant?.price ?? product?.price ?? 0
  const displayOriginalPrice = activeVariant?.compareAtPrice ?? product?.compareAtPrice
  const isAvailable = activeVariant?.availableForSale ?? false

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {loading ? (
        <div className="bg-background rounded-lg p-6 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          Loading product details...
        </div>
      ) : product ? (
        <>
          {/* Full Background Image */}
          <div className="absolute inset-0 overflow-hidden">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-secondary flex items-center justify-center">
                No image
              </div>
            )}
          </div>

          {/* Dark overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content Overlay */}
          <div className="relative z-10 w-full max-w-md mx-4 bg-background/95 backdrop-blur-sm rounded-lg overflow-hidden flex flex-col max-h-[90vh]">
            {/* Title and Price Section - Fixed at top */}
            <div className="p-6 border-b">
              {product.collection && (
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                  {product.collection}
                </p>
              )}
              <h2 className="font-serif text-2xl font-semibold mb-3">{product.title}</h2>
              <PriceDisplay
                currentPrice={displayPrice}
                compareAtPrice={displayOriginalPrice}
              />
            </div>

            {/* Scrollable Controls Section */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                {/* Variant Selection */}
                {product.options &&
                  product.options.length > 0 &&
                  product.options.map((option) => (
                    <div key={option.name}>
                      <label className="text-sm font-semibold mb-3 block">{option.name}</label>
                      <div className="flex flex-wrap gap-2">
                        {option.values.map((value) => {
                          const isSelected = selectedOptions[option.name] === value
                          const isOptionAvailable = checkAvailability(option.name, value)

                          return (
                            <button
                              key={value}
                              onClick={() => handleOptionSelect(option.name, value)}
                              disabled={!isOptionAvailable}
                              className={`px-4 py-2.5 border-2 rounded-lg text-sm font-medium transition-all ${
                                isSelected
                                  ? 'bg-foreground text-background border-foreground shadow-md scale-105'
                                  : isOptionAvailable
                                  ? 'border-border bg-background hover:border-foreground hover:shadow-sm'
                                  : 'border-border bg-muted text-muted-foreground line-through cursor-not-allowed opacity-50'
                              }`}
                            >
                              {value}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}

                {/* Quantity Selector */}
                <div>
                  <label className="text-sm font-semibold mb-3 block">Quantity</label>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-9 w-9 rounded-lg border-2"
                      variant="outline"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                    <Button
                      onClick={() => setQuantity(quantity + 1)}
                      className="h-9 w-9 rounded-lg border-2"
                      variant="outline"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Action Buttons */}
            <div className="p-6 border-t space-y-3">
              <Button
                onClick={handleAddToCart}
                disabled={!isAvailable}
                className="w-full"
                size="lg"
              >
                {addedToCart ? '✓ Added!' : 'Add to Cart'}
              </Button>
              <Button
                onClick={handleBuyNow}
                disabled={!isAvailable || isProcessing}
                variant="outline"
                className="w-full"
                size="lg"
              >
                {isProcessing ? 'Processing...' : 'Buy Now'}
              </Button>

              {/* Availability Status */}
              {!isAvailable && (
                <p className="text-sm text-red-500 text-center">
                  This variant is currently unavailable
                </p>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-background rounded-lg p-6 text-center">
          Failed to load product details
          <p className="text-sm text-muted-foreground mt-2">Handle: {productHandle}</p>
        </div>
      )}
    </div>
  )
}
