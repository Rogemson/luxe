"use client"

import { Button } from "@/components/ui/button"

interface CartSummaryProps {
  subtotal: number
  shipping?: number
  tax?: number
  discount?: number
  onCheckout: () => void
  isProcessing?: boolean
}

export function CartSummary({ subtotal, shipping = 0, tax = 0, discount = 0, onCheckout, isProcessing = false, }: CartSummaryProps) {
  const total = subtotal + shipping + tax - discount

  return (
    <div className="bg-secondary rounded-lg p-6 space-y-4">
      <h3 className="font-serif text-xl font-semibold">Order Summary</h3>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        {shipping > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>${shipping.toFixed(2)}</span>
          </div>
        )}

        {tax > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
        )}

        {discount > 0 && (
          <div className="flex justify-between text-accent">
            <span>Discount</span>
            <span>-${discount.toFixed(2)}</span>
          </div>
        )}

        <div className="border-t border-border pt-3 flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <Button
        onClick={onCheckout}
        disabled={isProcessing}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
      >
        {isProcessing ? "Processing..." : "Proceed to Checkout"}
      </Button>

      <Button variant="outline" className="w-full bg-transparent cursor-pointer">
        Continue Shopping
      </Button>
    </div>
  )
}
