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
    productByHandle: ShopifyProductNode | null
  }
}

export interface ShopifyRelatedProductsResponse {
  data: {
    productRecommendations: ShopifyProductNode[]
  }
}

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
  collections?: {
    edges: {
      node: {
        title: string
      }
    }[]
  }
  images?: {
    edges: Array<{
      node: {
        url: string
        altText?: string
      }
    }>
  }
  options?: Array<{
    id: string
    name: string
    values: string[]
  }>
  variants: {
    edges: Array<{
      node: {
        id: string
        title: string
        availableForSale: boolean
        price?: { amount: string }
        compareAtPrice?: { amount: string }
        image?: { url: string }
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

export interface CartItem {
  variantId: string
  merchandiseId: string
  quantity: number
  title: string
  handle: string
  image: string
  price: number
  variantTitle: string
}

// Define the shape of the context
export interface CartContextType {
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  cartCount: number
  totalPrice: number
  isEmpty: boolean
  checkout: () => Promise<void>
}

export interface ShopifyCheckoutUserError {
  field: string[]
  message: string
}

export interface ShopifyCheckout {
  id: string
  webUrl: string
}
export interface ShopifyUserError {
  field?: string[] | null;
  message: string;
}

export interface ShopifyCartResponse {
  cart?: {
    id: string;
    checkoutUrl?: string;
    lines: {
      edges: Array<{
        node: {
          id: string;
          quantity: number;
          merchandise: {
            id: string;
            title: string;
          };
        };
      }>;
    };
  } | null;
  userErrors?: ShopifyUserError[] | null;
}

export interface ShopifyAPIResponse {
  data?: {
    cartCreate?: ShopifyCartResponse | null;
  } | null;
}