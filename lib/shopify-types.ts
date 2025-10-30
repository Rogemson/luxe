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
            totalCount: number
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
        totalCount: number
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
        quantityAvailable?: number | null
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
  quantityAvailable: number | null
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
  compareAtPrice?: number
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
  lineId?: string
  quantity: number
  title: string
  handle: string
  image: string
  price: number
  variantTitle: string
  availableForSale: boolean
  quantityAvailable: number | null
  productTitle: string
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
  error: string | null // ✅ ADD
  isOnline: boolean
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

export interface ShopifyCustomer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  defaultAddress?: {
    address1?: string;
    city?: string;
    province?: string;
    zip?: string;
  };
}

export interface ShopifyCustomerCreateResponse {
  data?: {
    customerCreate?: {
      customer?: ShopifyCustomer;
      userErrors?: ShopifyUserError[];
    };
  };
  errors?: Array<{ message: string }>;
}

export interface ShopifyCustomerAccessToken {
  accessToken: string;
  expiresAt: string;
}

export interface ShopifyCustomerAccessTokenCreateResponse {
  data?: {
    customerAccessTokenCreate?: {
      customerAccessToken?: ShopifyCustomerAccessToken;
      userErrors?: ShopifyUserError[];
    };
  };
  errors?: Array<{ message: string }>;
}

export interface ShopifyCustomerQueryResponse {
  data?: {
    customer?: ShopifyCustomer;
  };
  errors?: Array<{ message: string }>;
}

export interface ShopifyOrderLineItem {
  title: string;
  quantity: number;
  variant?: {
    title?: string;
    image?: {
      url: string;
    };
  };
}

export interface ShopifyOrderNode {
  id: string;
  orderNumber: number;
  processedAt: string;
  statusUrl: string;
  totalPrice: {
    amount: string;
    currencyCode: string;
  };
  fulfillmentStatus: string;
  lineItems: {
    edges: Array<{
      node: ShopifyOrderLineItem;
    }>;
  };
}

export interface ShopifyOrdersResponse {
  data?: {
    customer?: {
      orders?: {
        edges: Array<{
          node: ShopifyOrderNode;
        }>;
      };
    };
  };
  errors?: Array<{ message: string }>;
}

export interface FormattedOrder {
  id: string;
  number: number;
  date: string;
  total: string;
  currency: string;
  status: string;
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    variantTitle: string;
    image?: string;
  }>;
}