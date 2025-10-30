import { MetadataRoute } from 'next'
import { getProducts, getCollections } from '@/lib/shopify-client'
import { siteUrl } from '@/lib/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // Fetch all products and collections
    const [products, collections] = await Promise.all([
      getProducts(250), // Adjust based on your catalog size
      getCollections(),
    ])

    // Product URLs
    const productUrls = products.map((product) => ({
      url: `${siteUrl}/products/${product.handle}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

    // Collection URLs
    const collectionUrls = collections.map((collection) => ({
      url: `${siteUrl}/collections/${collection.handle}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    // Static pages
    const staticPages = [
      {
        url: siteUrl,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 1.0,
      },
      {
        url: `${siteUrl}/products`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      },
      {
        url: `${siteUrl}/collections`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      },
    ]

    return [...staticPages, ...collectionUrls, ...productUrls]
  } catch (error) {
    console.error('Failed to generate sitemap:', error)
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
