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

export function CartItem({ id, name, price, image, quantity, size, color, onQuantityChange, onRemove }: CartItemProps) {
  return (
    <div className="flex gap-4 py-6 border-b border-border">
      <div className="relative w-24 h-32 flex-shrink-0">
        <Image src={image || "/placeholder.svg"} alt={name} fill className="object-cover rounded" />
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-serif text-lg font-semibold text-foreground">{name}</h3>
          <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
            {color && <span>Color: {color}</span>}
            {size && <span>Size: {size}</span>}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 border border-border rounded">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              className="h-8 w-8 p-0"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="w-8 text-center text-sm">{quantity}</span>
            <Button variant="ghost" size="sm" onClick={() => onQuantityChange(quantity + 1)} className="h-8 w-8 p-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="text-right">
            <p className="font-serif text-lg font-semibold">${(price * quantity).toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">${price.toFixed(2)} each</p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
