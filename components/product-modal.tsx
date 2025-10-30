'use client'

import { useState, useEffect }
from 'react'
import Image from 'next/image'
import { X, Minus, Plus, AlertTriangle, PackageX }
from 'lucide-react'
import { Button }
from '@/components/ui/button'
// We removed ScrollArea to make our own scrolling container
import { PriceDisplay }
from '@/components/sale-badge'
import { useCart }
from '@/context/cart'
import { createShopifyCheckout, getProductByHandle }
from '@/lib/shopify-client'
import { useProductVariants }
from '@/hooks/useProductVariants'
import { trackAddToCart, trackBeginCheckout }
from '@/lib/ga4'
import type { ShopifyProduct }
from '@/lib/shopify-types'
import { toast }
from 'sonner'

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
        className="h-10 w-10 shrink-0"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
      <Button
        variant="outline"
        size="icon"
        onClick={increment}
        disabled={isIncrementDisabled}
        className="h-10 w-10 shrink-0"
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
  const [fetchedProduct, setFetchedProduct] = useState < ShopifyProduct | null > (
    null
  )
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const { addToCart } = useCart()
  const product = productData || fetchedProduct

  // Re-added variant selection hooks, as they are essential
  const {
    activeVariant,
    handleOptionSelect,
    checkAvailability,
    selectedOptions,
  } = useProductVariants(product)

  // Stock and price logic
  const maxQuantity = activeVariant?.quantityAvailable ?? null
  const isOutOfStock = activeVariant ? !activeVariant.availableForSale : false
  const showLowStock =
    maxQuantity !== null && maxQuantity <= 10 && maxQuantity > 0
  const displayPrice = activeVariant?.price ?? product?.price ?? 0
  const displayOriginalPrice =
    activeVariant?.compareAtPrice ?? product?.compareAtPrice
  const displayImage = activeVariant?.image || product?.image || '/placeholder.svg'

  // --- Fixed useEffect Logic ---

  // 1. Effect to reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Use a microtask to prevent state updates on an unmounted component
      queueMicrotask(() => {
        setQuantity(1)
        setAddedToCart(false)
        setIsProcessing(false)
        setFetchedProduct(null) // Clear fetched data
      })
    }
  }, [isOpen])

  // 2. Effect to fetch data when modal opens
  useEffect(() => {
    // Don't run if closed, or if we already have data
    if (!isOpen || productData) {
      return
    }

    // Fetch only if we don't have the product
    if (!fetchedProduct) {
      getProductByHandle(productHandle)
        .then((product) => {
          if (product) {
            setFetchedProduct(product)
          }
        })
        .catch((err) => console.error('Failed to fetch product:', err))
    }
  }, [isOpen, productHandle, productData, fetchedProduct])

  // 3. Effect to adjust quantity based on stock
  useEffect(() => {
    if (maxQuantity !== null && quantity > maxQuantity) {
      setQuantity(Math.max(1, maxQuantity))
    }
  }, [maxQuantity, quantity])

  // --- Handlers ---

  const handleAddToCart = async () => {
    if (!activeVariant) {
      toast.error('Please select all options')
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
    const variantTitle = activeVariant.selectedOptions
      .map((opt) => opt.value)
      .join(' / ')

    try {
      await addToCart({
        variantId: activeVariant.id,
        merchandiseId: activeVariant.id,
        quantity,
        title: product!.title,
        handle: product!.handle,
        image: activeVariant.image || product!.image,
        price: activeVariant.price,
        variantTitle: variantTitle,
        availableForSale: activeVariant.availableForSale,
        quantityAvailable: activeVariant.quantityAvailable,
        productTitle: product!.title,
      })

      setAddedToCart(true)
      setTimeout(() => {
        onClose()
      }, 1500) // Close modal after 1.5s

      trackAddToCart(
        [
          {
            item_id: activeVariant.id,
            item_name: product!.title,
            item_category: product!.collection || 'Product',
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
    // ... (rest of checks are identical to handleAddToCart) ...
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
    const variantTitle = activeVariant.selectedOptions
      .map((opt) => opt.value)
      .join(' / ')

    try {
      const lines = [{ merchandiseId: activeVariant.id, quantity }]

      trackBeginCheckout(
        [
          {
            item_id: activeVariant.id,
            item_name: product!.title,
            item_category: product!.collection || 'Product',
            item_variant: variantTitle,
            price: activeVariant.price,
            quantity,
          },
        ],
        activeVariant.price * quantity
      )

      toast.loading('Preparing checkout...', { id: 'buy-now-loading' })
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

  // --- RENDER LOGIC ---

  // ✅ **FIX 1: Add this check.**
  // This is why the modal wasn't closing.
  if (!isOpen) {
    return null
  }

  // Show loading state, but only if we are fetching
  if (!product) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        {/* You can put a loader here if you want */}
      </div>
    )
  }

  // ✅ **FIX 2: Refactored "Minimal" Layout**
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {/* Main Panel: Kept minimal width, added flex-col and max-height */}
      <div className="relative w-full max-w-lg max-h-[90vh] bg-background rounded-lg shadow-2xl flex flex-col overflow-hidden">
        
        {/* --- 1. Fixed Header --- */}
        <div className="sticky top-0 flex items-start justify-between p-4 border-b bg-background z-10">
          <div className="flex-1">
            <h2 className="font-serif text-2xl font-semibold">
              {product.title}
            </h2>
            <PriceDisplay
              currentPrice={displayPrice}
              compareAtPrice={displayOriginalPrice}
            />
          </div>
          <button
            onClick={onClose}
            className="p-1 -mr-2 -mt-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* --- 2. Scrolling Content Area --- */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {/* Image */}
          <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-secondary">
            <Image
              src={displayImage}
              alt={product.title}
              fill
              className="object-cover"
            />
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-foreground/80">
              {product.description}
            </p>
          )}

          {/* ✅ **FIX 3: Added Variant Selection Back** */}
          {product.options &&
            product.options.length > 0 &&
            product.options[0].values.length > 1 && (
              <div className="space-y-4">
                {product.options.map((option) => (
                  <div key={option.name}>
                    <label className="text-sm font-semibold mb-2 block">
                      {option.name}
                    </label>
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
                            className={`px-3 py-1.5 border rounded-lg text-sm font-medium transition-all ${
                              isSelected
                                ? 'bg-foreground text-background border-foreground'
                                : isOptionAvailable
                                ? 'border-border bg-background hover:border-foreground'
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
              </div>
            )}
        </div>

        {/* --- 3. Fixed Footer --- */}
        <div className="sticky bottom-0 p-4 border-t bg-background z-10 space-y-3">
          {/* Stock Warnings */}
          {isOutOfStock ? (
            <div className="flex items-center gap-2 text-destructive text-sm font-medium">
              <PackageX className="w-4 h-4 shrink-0" />
              <p>This variant is currently out of stock</p>
            </div>
          ) : showLowStock ? (
            <div className="flex items-center gap-2 text-warning-foreground text-sm font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <p>Only {maxQuantity} left in stock</p>
            </div>
          ) : null}

          {/* Quantity */}
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold">Quantity</label>
            <QuantitySelector
              quantity={quantity}
              setQuantity={setQuantity}
              max={maxQuantity}
              disabled={isOutOfStock || !activeVariant}
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleAddToCart}
              disabled={
                !activeVariant || isProcessing || addedToCart || isOutOfStock
              }
              className="w-full"
              size="lg"
            >
              {addedToCart
                ? 'Added!'
                : isProcessing
                ? 'Adding...'
                : 'Add to Cart'}
            </Button>
            <Button
              onClick={handleBuyNow}
              disabled={
                !activeVariant || isProcessing || addedToCart || isOutOfStock
              }
              variant="outline"
              className="w-full"
              size="lg"
            >
              {isProcessing ? 'Processing...' : 'Buy Now'}
            </Button>
          </div>

          {!activeVariant && product.options.length > 0 && (
            <p className="text-xs text-muted-foreground text-center">
              Please select your options
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

