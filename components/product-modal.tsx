'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { X, Minus, Plus, AlertTriangle, PackageX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PriceDisplay } from '@/components/sale-badge'
import { useCart } from '@/context/cart'
import { createShopifyCheckout, getProductByHandle } from '@/lib/shopify-client'
import { useProductVariants } from '@/hooks/useProductVariants'
import { trackAddToCart, trackBeginCheckout } from '@/lib/ga4'
import type { ShopifyProduct } from '@/lib/shopify-types'
import { toast } from 'sonner'

// --- Quantity Selector Sub-component ---
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

// --- Main ProductModal Component ---
interface ProductModalProps {
  productHandle: string
  productData?: ShopifyProduct
  isOpen: boolean
  onClose: () => void
}

export function ProductModal({
  productHandle,
  productData,
  isOpen,
  onClose,
}: ProductModalProps) {
  const [fetchedProduct, setFetchedProduct] = useState<ShopifyProduct | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const { addToCart } = useCart()
  const prevProductHandleRef = useRef<string>(productHandle)
  const product = productData || fetchedProduct
  const { activeVariant } = useProductVariants(product)

  // ✅ Fixed: Add null checks
  const maxQuantity = activeVariant?.quantityAvailable ?? null
  const isOutOfStock = !activeVariant?.availableForSale
  const showLowStock =
    maxQuantity !== null &&
    maxQuantity <= 10 &&
    maxQuantity > 0

  useEffect(() => {
    if (!isOpen) return
    if (productData) return

    if (prevProductHandleRef.current !== productHandle) {
      setQuantity(1)
      setAddedToCart(false)
      setIsProcessing(false)
      setFetchedProduct(null)
      prevProductHandleRef.current = productHandle
    }

    if (!fetchedProduct) {
      getProductByHandle(productHandle)
        .then((fetchedProduct) => {
          if (fetchedProduct) {
            setFetchedProduct(fetchedProduct)
          }
        })
        .catch((err) => console.error('Failed to fetch product:', err))
    }
  }, [isOpen, productHandle, fetchedProduct, productData])

  useEffect(() => {
    if (maxQuantity !== null && quantity > maxQuantity) {
      setQuantity(Math.max(1, maxQuantity))
    }
  }, [maxQuantity, quantity])

  if (!product) return null

  const handleAddToCart = async () => {
    if (!activeVariant) {
      toast.error('Please select a variant')
      return
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

    setIsProcessing(true)

    try {
      // ✅ Fixed: Create variantTitle from selectedOptions
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

      setAddedToCart(true)
      setTimeout(() => {
        onClose()
        setAddedToCart(false)
      }, 1500)

      // ✅ Fixed: trackAddToCart expects array and total value
      trackAddToCart(
        [
          {
            item_id: activeVariant.id,
            item_name: product.title,
            item_category: product.collection || 'Product',
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
      setIsProcessing(false)
    }
  }

  const handleBuyNow = async () => {
    if (!activeVariant) {
      toast.error('Please select a variant')
      return
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

    setIsProcessing(true)

    try {
      const lines = [
        {
          merchandiseId: activeVariant.id,
          quantity,
        },
      ]

      // ✅ Fixed: Create variantTitle from selectedOptions
      const variantTitle = activeVariant.selectedOptions
        .map((opt) => opt.value)
        .join(' / ')

      trackBeginCheckout(
        [
          {
            item_id: activeVariant.id,
            item_name: product.title,
            item_category: product.collection || 'Product',
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
      window.location.href = checkoutUrl
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

      setIsProcessing(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="sticky top-0 flex items-center justify-between p-6 border-b bg-white z-10">
          <h2 className="text-2xl font-bold">{product.title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <ScrollArea className="h-[calc(90vh-80px)]">
          <div className="p-6 space-y-6">
            {product.image && (
              <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* ✅ Fixed: Use correct prop names */}
            <div>
              <PriceDisplay
                currentPrice={activeVariant?.price || product.price}
                compareAtPrice={activeVariant?.compareAtPrice || product.compareAtPrice}
              />
            </div>

            {isOutOfStock ? (
              <div className="flex items-center gap-2 text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3">
                <PackageX className="w-5 h-5 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Out of Stock</p>
                  <p className="text-xs">This variant is currently unavailable</p>
                </div>
              </div>
            ) : showLowStock && maxQuantity !== null ? (
              <div className="flex items-center gap-2 text-warning bg-warning/10 border border-warning/30 rounded-lg px-4 py-3">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Low Stock</p>
                  <p className="text-xs">Only {maxQuantity} left in stock</p>
                </div>
              </div>
            ) : null}

            {product.description && (
              <p className="text-gray-600">{product.description}</p>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity</label>
              <QuantitySelector
                quantity={quantity}
                setQuantity={setQuantity}
                max={maxQuantity}
                disabled={isOutOfStock}
              />
              {maxQuantity !== null && !isOutOfStock && (
                <p className="text-xs text-gray-500">
                  Maximum available: {maxQuantity}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleAddToCart}
                disabled={!activeVariant || isProcessing || isOutOfStock}
                className="w-full"
                size="lg"
              >
                {isProcessing
                  ? 'Adding...'
                  : addedToCart
                  ? 'Added to Cart!'
                  : isOutOfStock
                  ? 'Out of Stock'
                  : 'Add to Cart'}
              </Button>
              <Button
                onClick={handleBuyNow}
                disabled={!activeVariant || isProcessing || isOutOfStock}
                variant="outline"
                className="w-full"
                size="lg"
              >
                {isProcessing ? 'Processing...' : 'Buy Now'}
              </Button>
            </div>

            {!activeVariant && (
              <div className="bg-gray-100 border rounded-lg p-4 text-sm text-gray-600 text-center">
                Please select your options.
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}