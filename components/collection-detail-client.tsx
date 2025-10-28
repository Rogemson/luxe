'use client'

import { useEffect } from 'react'
import { trackViewItemList, trackPageView } from '@/lib/ga4'
import { ShopifyProduct } from '@/lib/shopify-types'

interface Collection {
  id: string
  handle: string
  title: string
  description?: string
}

interface Props {
  collection: Collection
  products: ShopifyProduct[]
  children: React.ReactNode
}

export function CollectionDetailClient({ collection, products, children }: Props) {
  useEffect(() => {
    // Track page view
    trackPageView(collection.title, `/collections/${collection.handle}`)

    // Track viewing products list
    if (products.length > 0) {
      const ga4Items = products.map((product, index) => ({
        item_id: product.handle,
        item_name: product.title,
        item_category: collection.title,
        price: product.price,
        quantity: 1,
        index: index + 1,
      }))

      trackViewItemList(
        ga4Items,
        collection.title,
        `collection_${collection.handle}`
      )
    }
  }, [collection, products])

  return <>{children}</>
}
