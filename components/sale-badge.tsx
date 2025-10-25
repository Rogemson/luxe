'use client'

import { cn } from '@/lib/utils'

interface SaleBadgeProps {
  currentPrice: number
  compareAtPrice?: number
  className?: string
  variant?: 'default' | 'large' | 'small'
}

export function SaleBadge({ 
  currentPrice, 
  compareAtPrice, 
  className,
  variant = 'default' 
}: SaleBadgeProps) {
  // No sale if compareAtPrice doesn't exist or is same/lower than current
  if (!compareAtPrice || compareAtPrice <= currentPrice) {
    return null
  }

  // Calculate discount percentage
  const discountPercent = Math.round(((compareAtPrice - currentPrice) / compareAtPrice) * 100)
  
  // Calculate savings
  const savings = compareAtPrice - currentPrice

  const sizes = {
    small: 'text-xs px-2 py-0.5',
    default: 'text-sm px-2.5 py-1',
    large: 'text-base px-3 py-1.5',
  }

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <span className={cn(
        'font-semibold rounded-md bg-red-500 text-white',
        sizes[variant]
      )}>
        {discountPercent}% OFF
      </span>
      {/* <span className="text-xs text-muted-foreground">
        Save ${savings.toFixed(2)}
      </span> */}
    </div>
  )
}

interface PriceDisplayProps {
  currentPrice?: number  // Make optional
  compareAtPrice?: number
  currency?: string
  className?: string
  showBadge?: boolean
}

export function PriceDisplay({
  currentPrice,
  compareAtPrice,
  currency = 'USD',
  className,
  showBadge = true,
}: PriceDisplayProps) {
  // Safety check - if no price, don't render anything
  if (currentPrice === undefined || currentPrice === null) {
    return null
  }

  const hasDiscount = compareAtPrice && compareAtPrice > currentPrice

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-baseline gap-2">
        {/* Current Price */}
        <span className={cn(
          'text-lg font-semibold',
          hasDiscount ? 'text-red-600' : 'text-foreground'
        )}>
          ${currentPrice.toFixed(2)}
        </span>

        {/* Original Price (strikethrough) */}
        {hasDiscount && (
          <span className="text-sm text-muted-foreground line-through">
            ${compareAtPrice.toFixed(2)}
          </span>
        )}
      </div>

      {/* Sale Badge */}
      {showBadge && hasDiscount && (
        <SaleBadge 
          currentPrice={currentPrice} 
          compareAtPrice={compareAtPrice}
          variant="small"
        />
      )}
    </div>
  )
}
