"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { X, Minus, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PriceDisplay } from "@/components/sale-badge"
import { useCart } from "@/context/cart"
import { createShopifyCheckout, getProductByHandle } from "@/lib/shopify-client"
import { useProductVariants } from "@/hooks/useProductVariants"
import type { ShopifyProduct } from "@/lib/shopify-types"

interface QuickAddModalProps {
  productHandle: string
  productData?: ShopifyProduct
  isOpen: boolean
  onClose: () => void
}

export function QuickAddModal({ productHandle, productData, isOpen, onClose }: QuickAddModalProps) {
  const { addToCart } = useCart()
  const [product, setProduct] = useState<ShopifyProduct | null>(productData || null)
  const [loading, setLoading] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)

  const { selectedOptions, activeVariant, handleOptionSelect, checkAvailability } = useProductVariants(product)

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

    const variantTitle = activeVariant.selectedOptions.map((opt) => opt.value).join(" / ")

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
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" 
      onClick={onClose}
    >
      <div
        className="relative rounded-xl shadow-2xl max-w-lg w-full h-[70vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Loading product details...</p>
          </div>
        ) : product ? (
          <>
            {/* Full Background Image */}
            <div className="absolute inset-0">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 512px"
                />
              ) : (
                <div className="w-full h-full bg-secondary flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">No image</span>
                </div>
              )}
              {/* Dark overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/90" />
            </div>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-4 right-4 z-30 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/20"
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Content Overlay */}
            <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col max-h-[70%]">
              {/* Title and Price Section - Fixed at top */}
              <div className="flex-shrink-0 px-5 pt-5 pb-3">
                {product.collection && (
                  <p className="text-xs uppercase tracking-wider text-white/90 mb-1 font-medium">
                    {product.collection}
                  </p>
                )}
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
                  {product.title}
                </h2>
                <div className="inline-block">
                  <PriceDisplay 
                    currentPrice={displayPrice} 
                    compareAtPrice={displayOriginalPrice} 
                    showBadge={true} 
                  />
                </div>
              </div>

              {/* Scrollable Controls Section */}
              <ScrollArea className="flex-1">
                <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl px-5 py-4 space-y-4 border-t border-white/20">
                  {/* Variant Selection */}
                  {product.options && product.options.length > 0 &&
                    product.options.map((option) => (
                      <div key={option.id}>
                        <p className="font-semibold text-xs mb-2 text-foreground">{option.name}</p>
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
                                    ? "bg-foreground text-background border-foreground shadow-md scale-105"
                                    : isOptionAvailable
                                      ? "border-border bg-background hover:border-foreground hover:shadow-sm"
                                      : "border-border bg-muted text-muted-foreground line-through cursor-not-allowed opacity-50"
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
                    <p className="font-semibold text-xs mb-2 text-foreground">Quantity</p>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="h-9 w-9 rounded-lg border-2"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="min-w-[2.5rem] text-center font-semibold text-base">{quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(quantity + 1)}
                        className="h-9 w-9 rounded-lg border-2"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button 
                      className={`flex-1 h-10 font-medium text-sm rounded-lg shadow-md ${
                        addedToCart ? "bg-green-600 hover:bg-green-600" : ""
                      }`}
                      disabled={!isAvailable || addedToCart} 
                      onClick={handleAddToCart}
                    >
                      {addedToCart ? "✓ Added!" : "Add to Cart"}
                    </Button>

                    <Button
                      variant="outline"
                      className="flex-1 h-10 font-medium text-sm rounded-lg border-2 bg-background/50 backdrop-blur-sm"
                      disabled={!isAvailable || isProcessing}
                      onClick={handleBuyNow}
                    >
                      {isProcessing ? "Processing..." : "Buy Now"}
                    </Button>
                  </div>

                  {/* Availability Status */}
                  {!isAvailable && (
                    <p className="text-xs text-red-600 dark:text-red-400 text-center font-medium pb-2">
                      This variant is currently unavailable
                    </p>
                  )}
                </div>
              </ScrollArea>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background p-8 text-center">
            <p className="text-muted-foreground text-lg mb-2">Failed to load product details</p>
            <p className="text-sm text-muted-foreground">Handle: {productHandle}</p>
          </div>
        )}
      </div>
    </div>
  )
}
