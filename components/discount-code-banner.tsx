'use client'

import { useState } from 'react'
import { Copy, Check, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DiscountCodeProps {
  code: string
  description: string
  discount: string
  className?: string
}

export function DiscountCodeBanner({ code, description, discount, className }: DiscountCodeProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn(
      'from-accent/10 to-primary/10 border-2 border-dashed border-accent rounded-lg p-4',
      'flex items-center justify-between gap-4',
      className
    )}>
      <div className="flex items-start gap-3 flex-1">
        <Tag className="w-5 h-5 text-accent mt-1" />
        <div>
          <p className="font-semibold text-foreground text-lg">{discount}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <code className="px-3 py-2 bg-background border border-border rounded-md font-mono text-sm font-semibold">
          {code}
        </code>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="gap-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

// Example usage component
export function PromotionalBanner() {
  const activeDiscounts = [
    {
      code: 'SAVE20',
      description: 'Get 20% off your entire order',
      discount: '20% OFF',
    },
    {
      code: 'FREESHIP',
      description: 'Free shipping on orders over $50',
      discount: 'FREE SHIPPING',
    },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Active Promotions</h2>
      {activeDiscounts.map((promo) => (
        <DiscountCodeBanner key={promo.code} {...promo} />
      ))}
    </div>
  )
}
