import { ShopifyProduct } from './shopify-types'
import { siteUrl } from './seo'

export function generateProductSchema(product: ShopifyProduct, handle: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${siteUrl}/products/${handle}#product`,
    name: product.title,
    description: product.description,
    url: `${siteUrl}/products/${handle}`,
    brand: {
      '@type': 'Brand',
      name: 'LUXE',
    },
    image: [product.image || `${siteUrl}/og-image.png`],
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/products/${handle}`,
      priceCurrency: 'USD',
      price: product.price.toFixed(2),
      availability: product.availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'LUXE',
        url: siteUrl,
      },
    },
  }
}

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

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'LUXE',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description: 'Premium clothing store with curated collections',
  }
}
