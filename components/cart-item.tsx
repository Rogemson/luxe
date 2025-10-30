"use client"

import { Minus, Plus, X, AlertTriangle, PackageX } from "lucide-react"
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
  availableForSale: boolean  // ✅ Add this
  quantityAvailable: number | null  // ✅ Add this
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
  availableForSale,
  quantityAvailable,
  onQuantityChange,
  onRemove,
}: CartItemProps) {
  // ✅ Calculate stock status
  const isOutOfStock = !availableForSale
  const isLowStock = quantityAvailable !== null && quantityAvailable <= 10 && quantityAvailable > 0
  const exceedsStock = quantityAvailable !== null && quantity > quantityAvailable
  
  return (
    <div className={`flex gap-4 p-4 border rounded-lg ${isOutOfStock ? 'opacity-60 bg-muted/50' : ''}`}>
      {/* Product Image */}
      <div className="relative w-24 h-24 rounded-md overflow-hidden bg-muted flex-shrink-0">
        <Image
          src={image || "/placeholder.png"}
          alt={name}
          fill
          className="object-cover"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <PackageX className="w-8 h-8 text-white" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-base">{name}</h3>
        
        {/* Variant details */}
        {(size || color) && (
          <div className="flex gap-2 text-sm text-muted-foreground mt-1">
            {size && <span>Size: {size}</span>}
            {color && <span>Color: {color}</span>}
          </div>
        )}

        {/* ✅ Stock Warnings */}
        <div className="mt-2 space-y-1">
          {isOutOfStock && (
            <div className="flex items-center gap-1 text-xs text-destructive font-medium">
              <PackageX className="w-3.5 h-3.5" />
              <span>Out of stock - Will be removed at checkout</span>
            </div>
          )}
          
          {!isOutOfStock && exceedsStock && (
            <div className="flex items-center gap-1 text-xs text-warning font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Only {quantityAvailable} available - Quantity will be adjusted</span>
            </div>
          )}
          
          {!isOutOfStock && !exceedsStock && isLowStock && (
            <div className="flex items-center gap-1 text-xs text-warning font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Only {quantityAvailable} left in stock</span>
            </div>
          )}
        </div>

        {/* Price */}
        <p className="text-lg font-semibold mt-2">${(price * quantity).toFixed(2)}</p>
        {quantity > 1 && (
          <p className="text-xs text-muted-foreground">${price.toFixed(2)} each</p>
        )}
      </div>

      {/* Quantity Controls + Remove */}
      <div className="flex flex-col items-end justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            disabled={isOutOfStock || quantity <= 1}
            className="h-8 w-8"
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="text-base font-medium w-8 text-center">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onQuantityChange(quantity + 1)}
            disabled={isOutOfStock || (quantityAvailable !== null && quantity >= quantityAvailable)}
            className="h-8 w-8"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
