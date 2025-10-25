import { useState, useEffect, useCallback } from "react"
import type { ShopifyProduct, ProductVariant } from "@/lib/shopify-types"

export function useProductVariants(product: ShopifyProduct | null) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [activeVariant, setActiveVariant] = useState<ProductVariant | null>(null)

  // Initialize selected options and find initial variant when product changes
  useEffect(() => {
    if (!product) return

    // Use a microtask to defer the state update (avoids synchronous warning)
    Promise.resolve().then(() => {
      const defaults: Record<string, string> = {}
      product.options.forEach((option) => {
        defaults[option.name] = option.values[0]
      })

      setSelectedOptions(defaults)

      const match = product.variants.find((variant) =>
        Object.entries(defaults).every(([name, value]) =>
          variant.selectedOptions.some(
            (opt) => opt.name === name && opt.value === value
          )
        )
      )
      setActiveVariant(match || null)
    })
  }, [product])

  const handleOptionSelect = useCallback(
    (optionName: string, value: string) => {
      if (!product) return

      const newSelectedOptions = {
        ...selectedOptions,
        [optionName]: value,
      }
      setSelectedOptions(newSelectedOptions)

      const match = product.variants.find((variant) =>
        Object.entries(newSelectedOptions).every(([name, value]) =>
          variant.selectedOptions.some(
            (opt) => opt.name === name && opt.value === value
          )
        )
      )
      setActiveVariant(match || null)

      return match || null
    },
    [selectedOptions, product]
  )

  const checkAvailability = useCallback(
    (optionName: string, optionValue: string): boolean => {
      if (!product) return false

      const hypotheticalSelection = {
        ...selectedOptions,
        [optionName]: optionValue,
      }
      const matchingVariant = product.variants.find((variant) =>
        Object.entries(hypotheticalSelection).every(([name, value]) =>
          variant.selectedOptions.some(
            (opt) => opt.name === name && opt.value === value
          )
        )
      )
      return matchingVariant?.availableForSale ?? false
    },
    [selectedOptions, product]
  )

  return {
    selectedOptions,
    activeVariant,
    handleOptionSelect,
    checkAvailability,
  }
}
