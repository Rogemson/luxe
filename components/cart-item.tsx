"use client"

import { Minus, Plus, X } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface CartItemProps {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  size?: string
  color?: string
  onQuantityChange: (quantity: number) => void
  onRemove: () => void
}

export function CartItem({
  name,
  price,
  image,
  quantity,
  size,
  color,
  onQuantityChange,
  onRemove,
}: CartItemProps) {
  return (
    <div className="relative flex flex-col sm:flex-row gap-4 py-6 border-b border-border">
      {/* Image */}
      <div className="relative w-full h-48 sm:w-24 sm:h-32 shrink-0">
        <Image
          src={image || "/placeholder.svg"}
          alt={name}
          fill
          className="object-cover rounded"
          sizes="(max-width: 640px) 100vw, 96px"
        />
      </div>

      {/* Remove Button - Positioned absolutely for all screen sizes */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="absolute top-6 right-0 w-8 h-8 p-0 text-muted-foreground hover:text-destructive"
        aria-label="Remove item"
      >
        <X className="w-4 h-4" />
      </Button>

      {/* Info & Actions */}
      <div className="flex-1 flex flex-col justify-between gap-4">
        {/* Top Info: Title & Variants */}
        <div>
          {/* Added pr-10 to prevent overlap with absolute X button */}
          <h3 className="font-serif text-lg font-semibold text-foreground pr-10">
            {name}
          </h3>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
            {color && <span>Color: {color}</span>}
            {size && <span>Size: {size}</span>}
          </div>
        </div>

        {/* Bottom Actions: Quantity & Price */}
        {/* Stacks vertically on mobile, row on desktop */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Quantity Selector */}
          <div className="flex items-center gap-2 border border-border rounded w-fit">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              className="h-8 w-8 p-0"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span
              className="w-8 text-center text-sm"
              aria-label={`Current quantity: ${quantity}`}
            >
              {quantity}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onQuantityChange(quantity + 1)}
              className="h-8 w-8 p-0"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Price */}
          {/* Aligns left on mobile, right on desktop */}
          <div className="text-left sm:text-right">
            <p className="text-lg font-semibold">
              ${(price * quantity).toFixed(2)}
            </p>
            {quantity > 1 && (
              <p className="text-sm text-muted-foreground">
                ${price.toFixed(2)} each
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}