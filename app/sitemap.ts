import { MetadataRoute } from 'next'
import { getProducts, getCollections } from '@/lib/shopify-client'
import { siteUrl } from '@/lib/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // Fetch all products and collections
    const [products, collections] = await Promise.all([
      getProducts(250),
      getCollections(),
    ])

    // ✅ IMPROVED: Use actual updatedAt if available from Shopify
    const productUrls = products.map((product) => ({
      url: `${siteUrl}/products/${product.handle}`,
      // Use product.updatedAt if your ShopifyProduct type includes it
      // Otherwise fall back to current date
      lastModified: (product as any).updatedAt ? new Date((product as any).updatedAt) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: product.availableForSale ? 0.8 : 0.5, // ✅ Lower priority for out-of-stock
    }))

    // ✅ Collection URLs with appropriate priorities
    const collectionUrls = collections.map((collection) => ({
      url: `${siteUrl}/collections/${collection.handle}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    // ✅ Static pages with appropriate change frequencies
    const staticPages = [
      {
        url: siteUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const, // ✅ Homepage changes frequently
        priority: 1.0,
      },
      {
        url: `${siteUrl}/products`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const, // ✅ Product listing changes frequently
        priority: 0.9,
      },
      {
        url: `${siteUrl}/collections`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      },
      // ✅ Add more static pages if you have them
      {
        url: `${siteUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      },
      {
        url: `${siteUrl}/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      },
    ]

    return [...staticPages, ...collectionUrls, ...productUrls]
  } catch (error) {
    console.error('Failed to generate sitemap:', error)
    // ✅ Return minimal sitemap on error
    return [
      {
        url: siteUrl,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 1.0,
      },
    ]
  }
}