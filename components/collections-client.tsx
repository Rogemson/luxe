'use client'

import { useEffect } from 'react'
import { trackViewItemList, trackPageView } from '@/lib/ga4'

interface Collection {
  id: string
  handle: string
  title: string
  image: string
  productCount?: number
}

interface Props {
  collections: Collection[]
  children: React.ReactNode
}

export function CollectionsClient({ collections, children }: Props) {
  useEffect(() => {
    // Track page view
    trackPageView('Collections', '/collections')

    // Track viewing collections list
    if (collections.length > 0) {
      const ga4Items = collections.map((collection, index) => ({
        item_id: collection.handle,
        item_name: collection.title,
        item_category: 'collection',
        quantity: collection.productCount || 0,
        index: index + 1,
      }))

      trackViewItemList(
        ga4Items,
        'Collections Page',
        'collections_page'
      )
    }
  }, [collections])

  return <>{children}</>
}
