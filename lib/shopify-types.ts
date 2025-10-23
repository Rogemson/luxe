// Type definitions for Shopify Storefront API

// ==========================
// GraphQL Response Types
// ==========================

export interface ShopifyCollectionResponse {
  data: {
    collections: {
      edges: Array<{
        node: {
          id: string
          handle: string
          title: string
          description: string
          image?: {
            url: string
            altText?: string
          }
          products: {
            edges: Array<{
              node: ShopifyProductNode
            }>
          }
        }
      }>
    }
  }
}

export interface ShopifyCollectionByHandleResponse {
  data: {
    collectionByHandle: {
      id: string
      handle: string
      title: string
      description: string
      image?: {
        url: string
        altText?: string
      }
      products: {
        edges: Array<{
          node: ShopifyProductNode
        }>
      }
    } | null
  }
}

// --- ADD THESE NEW TYPES ---

export interface ShopifyProductsResponse {
  data: {
    products: {
      edges: Array<{
        node: ShopifyProductNode
      }>
    }
  }
}

export interface ShopifyProductByHandleResponse {
  data: {
    // This can be null if no product is found with the handle
    productByHandle: ShopifyProductNode | null
  }
}

export interface ShopifyRelatedProductsResponse {
  data: {
    // Note: productRecommendations returns a direct array of nodes,
    // not an object with edges.
    productRecommendations: ShopifyProductNode[]
  }
}

// --- END OF NEW TYPES ---

export interface ShopifyProductNode {
  id: string
  handle: string
  title: string
  description: string
  priceRange: {
    minVariantPrice: {
      amount: string
      currencyCode: string
    }
  }
  compareAtPriceRange: {
    minVariantPrice: {
      amount: string
      currencyCode: string
    }
  }
  featuredImage?: {
    url: string
    altText?: string
  }
  images: {
    edges: Array<{
      node: {
        url: string
        altText?: string
      }
    }>
  }
  variants: {
    edges: Array<{
      node: {
        id: string
        title: string
        availableForSale: boolean
        selectedOptions: Array<{
          name: string
          value: string
        }>
      }
    }>
  }
  availableForSale: boolean
  productType: string
  tags: string[]
}

// ==========================
// Application Types
// ==========================
export interface ProductOption {
  id: string
  name: string
  values: string[]
}

export interface ProductVariant {
  id: string
  availableForSale: boolean
  price: number
  compareAtPrice?: number
  image?: string
  selectedOptions: Array<{
    name: string
    value: string
  }>
}

export interface ShopifyProduct {
  id: string
  handle: string
  title: string
  description: string
  price: number
  originalPrice?: number
  image: string
  images: string[]
  category: string
  availableForSale: boolean
  options: ProductOption[]
  variants: ProductVariant[]
  collection?: string
  sku?: string
  rating?: number
  reviews?: number
}

export interface ShopifyCollection {
  id: string
  handle: string
  title: string
  description: string
  image: string
  productCount: number
}

export interface ShopifyCart {
  items: Array<{
    variantId: string
    quantity: number
    size?: string
    color?: string
  }>
  total: number
}
