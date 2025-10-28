'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, ShoppingBag } from "lucide-react"
import { CartItem } from "@/components/cart-item"
import { CartSummary } from "@/components/cart-summary"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useCart } from "@/context/cart"
import { createShopifyCheckout } from "@/lib/shopify-client"
import { trackViewCart, trackBeginCheckout } from "@/lib/ga4"

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalPrice, isEmpty } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

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

  const handleCheckout = async (): Promise<void> => {
    if (isEmpty) return

    setIsProcessing(true)
    setCheckoutError(null)

    try {
      // Track begin checkout
      const ga4Items = cart.map((item) => ({
        item_id: item.variantId,
        item_name: item.title,
        item_variant: item.variantTitle,
        price: item.price,
        quantity: item.quantity,
      }))

      trackBeginCheckout(ga4Items, totalPrice)

      // Map cart items to Shopify CartLineInput format
      const lines = cart.map((item) => ({
        merchandiseId: item.variantId,
        quantity: item.quantity,
      }))

      // Create the Shopify checkout URL
      const checkoutUrl = await createShopifyCheckout(lines)

      // Redirect to Shopify checkout
      window.location.href = checkoutUrl
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create checkout. Please try again."
      console.error("Checkout error:", error)
      setCheckoutError(errorMessage)
      setIsProcessing(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shopping
          </Link>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold">
            Shopping Cart
          </h1>
        </div>

        {isEmpty ? (
          <div className="text-center py-16">
            <ShoppingBag className="mx-auto mb-4 w-20 h-20 text-muted-foreground" />
            <p className="text-lg text-muted-foreground mb-6">Your cart is empty</p>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-card rounded-lg p-6">
                {cart.map((item) => (
                  <CartItem
                    key={item.variantId}
                    id={item.variantId}
                    name={item.title}
                    price={item.price}
                    image={item.image}
                    quantity={item.quantity}
                    size={item.variantTitle}
                    onQuantityChange={(quantity) => updateQuantity(item.variantId, quantity)}
                    onRemove={() => removeFromCart(item.variantId)}
                  />
                ))}
              </div>
            </div>

            <div className="lg:col-span-1">
              <CartSummary
                subtotal={totalPrice}
                shipping={10}
                tax={totalPrice * 0.1}
                onCheckout={handleCheckout}
                isProcessing={isProcessing}
              />

              {checkoutError && (
                <p className="mt-4 text-sm text-red-500">{checkoutError}</p>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
