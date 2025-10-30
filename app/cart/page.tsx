'use client'

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { ArrowLeft, ShoppingBag, AlertTriangle, PackageX } from "lucide-react"
import { CartItem } from "@/components/cart-item"
import { CartSummary } from "@/components/cart-summary"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useCart } from "@/context/cart"
import { createShopifyCheckout } from "@/lib/shopify-client"
import { trackViewCart, trackBeginCheckout } from "@/lib/ga4"
import { toast } from 'sonner'

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalPrice, isEmpty } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)

  // ✅ Calculate stock issues
  const stockIssues = useMemo(() => {
    const unavailableItems = cart.filter(item => !item.availableForSale)
    const excessQuantityItems = cart.filter(item => 
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
    return cart.filter(item => item.availableForSale)
  }, [cart])

  // Track view cart on page load
  useEffect(() => {
    if (!isEmpty) {
      const ga4Items = cart.map((item) => ({
        item_id: item.variantId,
        item_name: item.title,
        item_variant: item.variantTitle,
        price: item.price,
        quantity: item.quantity,
      }))

      trackViewCart(ga4Items, totalPrice)
    }
  }, [cart, isEmpty, totalPrice])

  const handleCheckout = async () => {
    if (!navigator.onLine) {
      toast.error('No internet connection', {
        description: 'Please check your connection and try again.',
      })
      return
    }

    setIsProcessing(true)

    try {
      // ✅ Filter out unavailable items and adjust quantities
      const checkoutLines = availableItems.map((item) => {
        const adjustedQuantity = item.quantityAvailable !== null && item.quantity > item.quantityAvailable
          ? item.quantityAvailable
          : item.quantity
        
        return {
          merchandiseId: item.variantId,
          quantity: adjustedQuantity,
        }
      }).filter(line => line.quantity > 0)

      if (checkoutLines.length === 0) {
        toast.error('Cannot proceed to checkout', {
          description: 'All items in your cart are unavailable.',
        })
        setIsProcessing(false)
        return
      }

      // ✅ Show warning if items were excluded
      if (stockIssues.hasUnavailableItems) {
        toast.warning('Some items excluded', {
          description: `${stockIssues.unavailableItems.length} unavailable item(s) will be removed from checkout.`,
          duration: 5000,
        })
      }

      // ✅ Show warning if quantities were adjusted
      if (stockIssues.hasExcessQuantity) {
        toast.warning('Quantities adjusted', {
          description: 'Some item quantities were reduced to match available stock.',
          duration: 5000,
        })
      }

      // Track begin checkout
      const ga4Items = checkoutLines.map((line) => {
        const item = cart.find(i => i.variantId === line.merchandiseId)!
        return {
          item_id: item.variantId,
          item_name: item.title,
          item_variant: item.variantTitle,
          price: item.price,
          quantity: line.quantity,
        }
      })

      trackBeginCheckout(ga4Items, totalPrice)

      toast.loading('Preparing checkout...', {
        id: 'checkout-loading',
      })

      const checkoutUrl = await createShopifyCheckout(checkoutLines)

      toast.dismiss('checkout-loading')
      window.location.assign(checkoutUrl)
    } catch (error) {
      console.error("Checkout error:", error)
      
      toast.dismiss('checkout-loading')
      
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        toast.error('Connection problem', {
          description: 'Could not reach checkout. Please check your internet.',
          duration: 5000,
        })
      } else {
        toast.error('Checkout failed', {
          description: 'Please try again or contact support.',
          action: {
            label: 'Retry',
            onClick: handleCheckout,
          },
          duration: 5000,
        })
      }
      
      setIsProcessing(false)
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back to Shopping */}
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>

          <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

          {isEmpty ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Add some products to get started
              </p>
              <Button asChild size="lg">
                <Link href="/products">Shop Now</Link>
              </Button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {/* ✅ Stock Issues Banner */}
                {stockIssues.hasIssues && (
                  <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                      <div className="flex-1 space-y-2">
                        <h3 className="font-semibold text-warning">Stock Issues Detected</h3>
                        {stockIssues.hasUnavailableItems && (
                          <p className="text-sm">
                            {stockIssues.unavailableItems.length} item(s) are currently out of stock and will be removed at checkout.
                          </p>
                        )}
                        {stockIssues.hasExcessQuantity && (
                          <p className="text-sm">
                            Some items have quantities that exceed available stock. Quantities will be adjusted automatically.
                          </p>
                        )}
                        <ul className="text-sm space-y-1 mt-2">
                          {stockIssues.unavailableItems.map(item => (
                            <li key={item.variantId} className="flex items-center gap-2">
                              <PackageX className="w-3.5 h-3.5" />
                              <span>{item.title} - Out of stock</span>
                            </li>
                          ))}
                          {stockIssues.excessQuantityItems.map(item => (
                            <li key={item.variantId} className="flex items-center gap-2">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>{item.title} - Only {item.quantityAvailable} available (you have {item.quantity})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cart Items List */}
                {cart.map((item) => (
                  <CartItem
                    key={item.variantId}
                    id={item.variantId}
                    name={item.title}
                    price={item.price}
                    image={item.image}
                    quantity={item.quantity}
                    size={item.variantTitle !== "Default" ? item.variantTitle : undefined}
                    availableForSale={item.availableForSale}
                    quantityAvailable={item.quantityAvailable}
                    onQuantityChange={(newQuantity) =>
                      updateQuantity(item.variantId, newQuantity)
                    }
                    onRemove={() => removeFromCart(item.variantId)}
                  />
                ))}
              </div>

              {/* Cart Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <CartSummary
                    subtotal={totalPrice}
                    onCheckout={handleCheckout}
                    isProcessing={isProcessing}
                    disabled={availableItems.length === 0}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
