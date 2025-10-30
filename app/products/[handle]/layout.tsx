import type { Metadata } from 'next'
import { getProductByHandle } from '@/lib/shopify-client'
import { siteUrl, siteName } from '@/lib/seo'

interface ProductLayoutProps {
  children: React.ReactNode
  params: Promise<{ handle: string }>
}

export async function generateMetadata({
  params,
}: ProductLayoutProps): Promise<Metadata> {
  const { handle } = await params
  const product = await getProductByHandle(handle)

  if (!product) {
    return {
      title: 'Product Not Found',
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const title = `${product.title} - Buy Now | ${siteName}`
  const description = `${product.description?.substring(0, 160) || product.title} - $${product.price.toFixed(2)}`
  const url = `${siteUrl}/products/${handle}`
  
  // ✅ Use product image directly (fallback)
  const imageUrl = product.image || `${siteUrl}/og-image.png`

  return {
    title,
    description,
    robots: {
      index: product.availableForSale ? true : false,
      follow: true,
    },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName,
      images: [
        {
          url: imageUrl, // ✅ Simple image URL
          width: 1200,
          height: 630,
          alt: product.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: url,
    },
  }
}

export default function ProductLayout({
  children,
}: ProductLayoutProps) {
  return children
}
