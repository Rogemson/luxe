import { ShopifyProduct } from './shopify-types'
import { siteUrl, siteName } from './seo'

// ✅ ENHANCED: Product schema with priceValidUntil and better structure
export function generateProductSchema(product: ShopifyProduct, handle: string) {
  // Calculate price valid until (30 days from now)
  const priceValidUntil = new Date()
  priceValidUntil.setDate(priceValidUntil.getDate() + 30)

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${siteUrl}/products/${handle}#product`,
    name: product.title,
    description: product.description || product.title,
    url: `${siteUrl}/products/${handle}`,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: siteName,
    },
    image: product.images.length > 0 ? product.images : [product.image || `${siteUrl}/og-image.png`],
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/products/${handle}`,
      priceCurrency: 'USD',
      price: product.price.toFixed(2),
      priceValidUntil: priceValidUntil.toISOString(), // ✅ NEW: Price expiry
      availability: product.availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition', // ✅ NEW: Item condition
      seller: {
        '@type': 'Organization',
        name: siteName,
        url: siteUrl,
      },
    },
    // ✅ NEW: Add category if collection exists
    ...(product.collection && {
      category: product.collection,
    }),
  }
}

// ✅ Existing breadcrumb schema
export function generateBreadcrumbSchema(
  breadcrumbs: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

// ✅ ENHANCED: Organization schema with social profiles
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: siteName,
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/logo.png`,
      width: 250,
      height: 60,
    },
    description: 'Premium clothing store with curated collections of quality, sustainable fashion.',
    // ✅ NEW: Add contact information
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'support@luxestore.com', // Update with your actual email
    },
    // ✅ NEW: Social media profiles (update with your actual profiles)
    sameAs: [
      'https://www.facebook.com/luxestore',
      'https://www.instagram.com/luxestore',
      'https://twitter.com/luxestore',
    ],
  }
}

// ✅ NEW: Collection/Category Page Schema
export function generateCollectionSchema(
  collection: {
    title: string
    handle: string
    description?: string
    productCount?: number
  }
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${siteUrl}/collections/${collection.handle}#page`,
    name: collection.title,
    description: collection.description || `Shop ${collection.title} collection`,
    url: `${siteUrl}/collections/${collection.handle}`,
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: siteName,
    },
    ...(collection.productCount && {
      numberOfItems: collection.productCount,
    }),
  }
}

// ✅ NEW: Website Schema for homepage
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    url: siteUrl,
    name: siteName,
    description: 'Premium clothing store with curated collections',
    publisher: {
      '@id': `${siteUrl}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

// ✅ NEW: ItemList Schema for product listing pages
export function generateProductListSchema(
  products: Array<{ title: string; handle: string; price: number; image?: string }>,
  listName: string = 'Products'
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: product.title,
        url: `${siteUrl}/products/${product.handle}`,
        image: product.image || `${siteUrl}/og-image.png`,
        offers: {
          '@type': 'Offer',
          price: product.price.toFixed(2),
          priceCurrency: 'USD',
        },
      },
    })),
  }
}