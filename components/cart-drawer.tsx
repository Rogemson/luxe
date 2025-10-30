'use client'

import { useEffect } from 'react'
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  AlertTriangle,
  PackageX,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useCart } from '@/context/cart'
import { createShopifyCheckout } from '@/lib/shopify-client'
import { trackBeginCheckout } from '@/lib/ga4'
import { useState, useMemo } from 'react'
import { toast } from 'sonner'

export function CartDrawer() {
  const { cart, cartCount, totalPrice, updateQuantity, removeFromCart, isEmpty } =
    useCart()
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null)

  // ✅ Calculate stock issues
  const stockIssues = useMemo(() => {
    const unavailableItems = cart.filter((item) => !item.availableForSale)
    const excessQuantityItems = cart.filter(
      (item) =>
        item.availableForSale &&
        item.quantityAvailable !== null &&
        item.quantity > item.quantityAvailable
    )

    return {
      hasUnavailableItems: unavailableItems.length > 0,
      hasExcessQuantity: excessQuantityItems.length > 0,
      unavailableItems,
      excessQuantityItems,
      hasIssues: unavailableItems.length > 0 || excessQuantityItems.length > 0,
    }
  }, [cart])

  // ✅ Calculate available items for checkout
  const availableItems = useMemo(() => {
    return cart.filter((item) => {
      if (!item.availableForSale) return false
      if (
        item.quantityAvailable !== null &&
        item.quantity > item.quantityAvailable
      ) {
        // Item is available, but quantity will be adjusted
        return true
      }
      return true
    })
  }, [cart])

  // ✅ Handle checkout with stock logic
  const handleCheckout = async () => {
    if (isEmpty) return

    if (!navigator.onLine) {
      toast.error("No internet connection", {
        description: "Please check your connection and try again.",
      })
      return
    }

    setIsProcessing(true)

    try {
      const checkoutLines = availableItems
        .map((item) => {
          const adjustedQuantity =
            item.quantityAvailable !== null &&
            item.quantity > item.quantityAvailable
              ? item.quantityAvailable
              : item.quantity

          return {
            merchandiseId: item.variantId,
            quantity: adjustedQuantity,
          }
        })
        .filter((line) => line.quantity > 0)

      if (checkoutLines.length === 0) {
        toast.error("Cannot proceed to checkout", {
          description: "All items in your cart are unavailable.",
        })
        setIsProcessing(false)
        return
      }

      if (stockIssues.hasUnavailableItems) {
        toast.warning("Some items excluded", {
          description: `${stockIssues.unavailableItems.length} unavailable item(s) removed from checkout.`,
          duration: 5000,
        })
      }

      if (stockIssues.hasExcessQuantity) {
        toast.warning("Quantities adjusted", {
          description:
            "Some item quantities were reduced to match available stock.",
          duration: 5000,
        })
      }

      const ga4Items = checkoutLines.map((line) => {
        const item = cart.find((i) => i.variantId === line.merchandiseId)!
        return {
          item_id: item.variantId,
          item_name: item.title,
          item_variant: item.variantTitle,
          price: item.price,
          quantity: line.quantity,
        }
      })

      const adjustedTotalPrice = ga4Items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      )
      trackBeginCheckout(ga4Items, adjustedTotalPrice)

      toast.loading("Preparing checkout...", { id: "checkout-loading" })

      const checkoutUrl = await createShopifyCheckout(checkoutLines)

      toast.dismiss("checkout-loading")
      setRedirectUrl(checkoutUrl) // ✅ trigger redirect via state
    } catch (error) {
      console.error("Checkout error:", error)
      toast.dismiss("checkout-loading")

      if (error instanceof TypeError && error.message === "Failed to fetch") {
        toast.error("Connection problem", {
          description: "Could not reach checkout. Please check your internet.",
          duration: 5000,
        })
      } else {
        toast.error("Checkout failed", {
          description: "Please try again or contact support.",
          action: {
            label: "Retry",
            onClick: handleCheckout,
          },
          duration: 5000,
        })
      }

      setIsProcessing(false)
    }
  }

  useEffect(() => {
    if (redirectUrl) {
      window.location.href = redirectUrl
    }
  }, [redirectUrl])

  // ✅ Helper function to check if item is low stock
  const isLowStock = (item: (typeof cart)[0]) => {
    return (
      item.quantityAvailable !== null &&
      item.quantityAvailable <= 10 &&
      item.quantityAvailable > 0
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {/* --- Polished SheetTrigger --- */}
      <SheetTrigger asChild>
        <button className="relative p-2 hover:bg-secondary rounded-full transition-colors">
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </SheetTrigger>
      {/* --- Polished SheetContent --- */}
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="flex items-center text-2xl font-sans gap-2">
            <ShoppingCart className="w-5 h-5" />
            Cart ({cartCount})
          </SheetTitle>
        </SheetHeader>

        {/* --- Polished Empty State --- */}
        {isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-4">
              <ShoppingCart className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6">
              Add some products to get started
            </p>
            <Button onClick={() => setIsOpen(false)} asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* --- Stock Issues Banner (from functional file) --- */}
            {stockIssues.hasIssues && (
              <div className="bg-warning/10 border-b border-warning/30 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs space-y-1">
                    {stockIssues.hasUnavailableItems && (
                      <p className="font-medium text-warning">
                        {stockIssues.unavailableItems.length} item(s) out of
                        stock
                      </p>
                    )}
                    {stockIssues.hasExcessQuantity && (
                      <p className="text-warning/80">
                        Some quantities exceed available stock
                      </p>
                    )}
                    <p className="text-muted-foreground">
                      Unavailable items will be excluded and quantities adjusted
                      at checkout.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* --- Polished ScrollArea with functional item logic --- */}
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-4 py-4">
                {cart.map((item) => {
                  const itemIsOutOfStock = !item.availableForSale
                  const itemExceedsStock =
                    item.quantityAvailable !== null &&
                    item.quantity > item.quantityAvailable
                  const itemIsLowStock = isLowStock(item)

                  return (
                    <div
                      key={item.variantId}
                      className={`flex gap-4 pb-4 border-b last:border-0 ${
                        itemIsOutOfStock ? 'opacity-60' : ''
                      }`}
                    >
                      {/* Product Image */}
                      <div className="relative w-20 h-20 shrink-0 bg-secondary rounded-lg overflow-hidden">
                        <Image
                          src={item.image || '/placeholder.svg'}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                        {itemIsOutOfStock && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <PackageX className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${item.handle}`}
                          onClick={() => setIsOpen(false)}
                          className="font-medium text-sm hover:text-primary transition-colors line-clamp-1"
                        >
                          {item.title}
                        </Link>
                        {item.variantTitle &&
                          item.variantTitle !== 'Default' && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.variantTitle}
                            </p>
                          )}

                        {/* --- Stock Warnings (from functional file) --- */}
                        {itemIsOutOfStock && (
                          <div className="flex items-center gap-1 text-xs text-destructive font-medium mt-1">
                            <PackageX className="w-3 h-3" />
                            <span>Out of stock</span>
                          </div>
                        )}

                        {!itemIsOutOfStock && itemExceedsStock && (
                          <div className="flex items-center gap-1 text-xs text-warning font-medium mt-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Only {item.quantityAvailable} available</span>
                          </div>
                        )}

                        {!itemIsOutOfStock &&
                          !itemExceedsStock &&
                          itemIsLowStock && (
                            <div className="flex items-center gap-1 text-xs text-warning font-medium mt-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Only {item.quantityAvailable} left</span>
                            </div>
                          )}

                        <p className="text-sm font-semibold mt-2">
                          ${item.price.toFixed(2)}
                        </p>

                        {/* --- Quantity Controls (with functional disabled logic) --- */}
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              updateQuantity(item.variantId, item.quantity - 1)
                            }
                            disabled={itemIsOutOfStock}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              updateQuantity(item.variantId, item.quantity + 1)
                            }
                            disabled={
                              itemIsOutOfStock ||
                              (item.quantityAvailable !== null &&
                                item.quantity >= item.quantityAvailable)
                            }
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 ml-auto text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                            onClick={() => removeFromCart(item.variantId)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {/* --- Polished Item Total --- */}
                      <div className="text-right">
                        <p className="text-sm font-semibold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>

            {/* --- Polished Footer (with functional disabled logic) --- */}
            <div className="border-t p-6 space-y-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Shipping and taxes calculated at checkout
              </p>

              <div className="space-y-2">
                <Button
                  onClick={handleCheckout}
                  disabled={isProcessing || availableItems.length === 0}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing
                    ? 'Processing...'
                    : availableItems.length === 0
                    ? 'No items available'
                    : 'Checkout'}
                </Button>
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="outline"
                  className="w-full"
                  size="lg"
                  asChild
                >
                  <Link href="/cart">View Full Cart</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
