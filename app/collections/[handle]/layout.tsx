import type { Metadata } from 'next'
import { getCollectionByHandle } from '@/lib/shopify-client'
import { siteUrl, siteName } from '@/lib/seo'

interface CollectionLayoutProps {
  children: React.ReactNode
  params: Promise<{ handle: string }>
}

export async function generateMetadata({
  params,
}: CollectionLayoutProps): Promise<Metadata> {
  const { handle } = await params
  const collection = await getCollectionByHandle(handle)

  if (!collection) {
    return {
      title: 'Collection Not Found',
      robots: {
        index: false,
      },
    }
  }

  const title = `${collection.title} - Premium ${collection.title} Collection | ${siteName}`
  const description = `${collection.description?.substring(0, 160) || collection.title}. Shop our curated selection of ${collection.title} products.`
  const url = `${siteUrl}/collections/${handle}`
  const image = collection.image || `${siteUrl}/og-image.png`

  return {
    title,
    description,
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: collection.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    alternates: {
      canonical: url,
    },
  }
}

export default function CollectionLayout({
  children,
}: CollectionLayoutProps) {
  return children
}
