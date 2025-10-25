import type {
  ShopifyProduct,
  ShopifyCollection,
  ShopifyCollectionResponse,
  ShopifyCollectionByHandleResponse,
  ShopifyProductNode,
  ProductOption,
  ProductVariant,
  ShopifyProductsResponse,
  ShopifyProductByHandleResponse,
  ShopifyRelatedProductsResponse,
  ShopifyAPIResponse,
} from "./shopify-types"

import {
  GET_PRODUCTS_QUERY,
  GET_PRODUCT_BY_HANDLE_QUERY,
  GET_RELATED_PRODUCTS_QUERY,
} from "@/lib/queries/product-queries"

import {
  GET_COLLECTIONS_QUERY,
  GET_COLLECTION_BY_HANDLE_QUERY,
} from "@/lib/queries/collection-queries"

import {
  CART_CREATE_MUTATION,
} from "@/lib/queries/checkout-queries"

const SHOPIFY_STORE_URL = process.env.NEXT_PUBLIC_SHOPIFY_STORE_URL
const SHOPIFY_ACCESS_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN
const SHOPIFY_API_VERSION = "2024-01"

interface CacheEntry<T> {
  data: T
  timestamp: number
}

// ✅ ADD CACHING
const cache = new Map<string, CacheEntry<unknown>>()
const CACHE_TTL = 5 * 60 * 1000

// Helper function to make Shopify API requests
export async function shopifyFetch<T>(
  query: string, 
  variables?: Record<string, unknown>
): Promise<T> {
  if (!SHOPIFY_STORE_URL || !SHOPIFY_ACCESS_TOKEN) {
    const errorMsg = `Shopify configuration is missing. Store URL: ${SHOPIFY_STORE_URL ? "set" : "MISSING"}, Access Token: ${SHOPIFY_ACCESS_TOKEN ? "set" : "MISSING"}`
    console.error("❌", errorMsg)
    throw new Error(errorMsg)
  }

  const endpoint = `https://${SHOPIFY_STORE_URL}/api/${SHOPIFY_API_VERSION}/graphql.json`

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_ACCESS_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 3600 }, // ✅ CHANGED: Use Next.js caching instead of no-store
  })

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.statusText}`)
  }

  const json = await response.json()

  if (json.errors) {
    throw new Error(`Shopify GraphQL error: ${JSON.stringify(json.errors)}`)
  }

  return json as T
}

// Transform Shopify product node to app format
function transformProduct(node: ShopifyProductNode): ShopifyProduct {
  const price = parseFloat(node?.priceRange?.minVariantPrice?.amount ?? "0")
  const compareAtPrice = parseFloat(
    node?.compareAtPriceRange?.minVariantPrice?.amount ?? "0"
  )

  const collectionName = node.collections?.edges?.[0]?.node?.title

  const options: ProductOption[] =
    node.options?.map((option) => ({
      id: option.id,
      name: option.name,
      values: option.values,
    })) ?? []

  const variants: ProductVariant[] =
    node.variants?.edges?.map((edge) => {
      const variantNode = edge.node
      const variantPrice = parseFloat(variantNode.price?.amount ?? "0")
      const variantCompareAtPrice = parseFloat(
        variantNode.compareAtPrice?.amount ?? "0"
      )

      return {
        id: variantNode.id,
        availableForSale: variantNode.availableForSale,
        price: variantPrice,
        compareAtPrice:
          variantCompareAtPrice > variantPrice
            ? variantCompareAtPrice
            : undefined,
        image: variantNode.image?.url,
        selectedOptions: variantNode.selectedOptions.map((opt) => ({
          name: opt.name,
          value: opt.value,
        })),
      }
    }) ?? []

  const images =
    node.images?.edges
      ?.map((edge) => edge?.node?.url)
      .filter((url): url is string => !!url) ?? []

  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    description: node.description || "",
    price,
    compareAtPrice: compareAtPrice > price ? compareAtPrice : undefined,
    image: node.featuredImage?.url || images[0] || "",
    images: images,
    category: node.productType || "Uncategorized",
    collection: collectionName,
    availableForSale: node.availableForSale ?? false,
    options: options,
    variants: variants,
  }
}

// Get all collections
export async function getCollections(): Promise<ShopifyCollection[]> {
  const cacheKey = 'collections'
  const cached = cache.get(cacheKey) as CacheEntry<ShopifyCollection[]> | undefined

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('✅ Returning cached collections')
    return cached.data
  }

  try {
    const response = await shopifyFetch<ShopifyCollectionResponse>(GET_COLLECTIONS_QUERY)

    const collections = response.data.collections.edges.map((edge) => ({
      id: edge.node.id,
      handle: edge.node.handle,
      title: edge.node.title,
      description: edge.node.description,
      image: edge.node.image?.url || "/placeholder-collection.jpg",
      productCount: edge.node.products.edges.length,
    }))

    cache.set(cacheKey, { data: collections, timestamp: Date.now() })
    return collections
  } catch (error) {
    console.error("❌ Error fetching collections:", error)
    if (cached) return cached.data
    return []
  }
}

// Get collection by handle
export async function getCollectionByHandle(handle: string): Promise<ShopifyCollection | null> {
  const cacheKey = `collection-${handle}`
  const cached = cache.get(cacheKey) as CacheEntry<ShopifyCollection | null> | undefined

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('✅ Returning cached collection:', handle)
    return cached.data
  }

  try {
    const response = await shopifyFetch<ShopifyCollectionByHandleResponse>(
      GET_COLLECTION_BY_HANDLE_QUERY,
      { handle }
    )

    const collection = response.data.collectionByHandle

    if (!collection) {
      return null
    }

    console.log("✅ Collection found:", collection.title)

    const result = {
      id: collection.id,
      handle: collection.handle,
      title: collection.title,
      description: collection.description,
      image: collection.image?.url || "/placeholder-collection.jpg",
      productCount: collection.products.edges.length,
    }

    cache.set(cacheKey, { data: result, timestamp: Date.now() })
    return result
  } catch (error) {
    console.error("❌ Error fetching collection:", error)
    if (cached) return cached.data
    return null
  }
}

// Get products for a specific collection
export async function getCollectionProducts(handle: string): Promise<ShopifyProduct[]> {
  const cacheKey = `collection-products-${handle}`
  const cached = cache.get(cacheKey) as CacheEntry<ShopifyProduct[]> | undefined

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('✅ Returning cached collection products:', handle)
    return cached.data
  }

  try {
    const response = await shopifyFetch<ShopifyCollectionByHandleResponse>(
      GET_COLLECTION_BY_HANDLE_QUERY,
      { handle }
    )

    const collection = response.data.collectionByHandle

    if (!collection) {
      return []
    }

    const products = collection.products.edges.map((edge) => transformProduct(edge.node))
    cache.set(cacheKey, { data: products, timestamp: Date.now() })
    return products
  } catch (error) {
    console.error("❌ Error fetching collection products:", error)
    if (cached) return cached.data
    return []
  }
}

// Backward compatibility
export async function getCollectionById(id: string): Promise<ShopifyCollection | null> {
  console.warn("getCollectionById is deprecated, use getCollectionByHandle instead")
  return getCollectionByHandle(id)
}

export async function getProducts(count: number = 20): Promise<ShopifyProduct[]> {
  const cacheKey = `products-${count}`
  const cached = cache.get(cacheKey) as CacheEntry<ShopifyProduct[]> | undefined

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('✅ Returning cached products:', count)
    return cached.data
  }

  console.log('🔄 Fetching fresh products from Shopify:', count)

  try {
    const response = await shopifyFetch<ShopifyProductsResponse>(
      GET_PRODUCTS_QUERY,
      { first: count }
    )

    if (!response.data?.products) {
      return []
    }

    const products = response.data.products.edges.map((edge) =>
      transformProduct(edge.node)
    )

    cache.set(cacheKey, { data: products, timestamp: Date.now() })
    return products
  } catch (error) {
    console.error("❌ Error fetching all products:", error)
    if (cached) return cached.data
    return []
  }
}

// ✅ Properly typed getProductByHandle
export async function getProductByHandle(
  handle: string
): Promise<ShopifyProduct | null> {
  const cacheKey = `product-${handle}`
  const cached = cache.get(cacheKey) as CacheEntry<ShopifyProduct | null> | undefined

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('✅ Returning cached product:', handle)
    return cached.data
  }

  console.log('🔄 Fetching product from Shopify:', handle)

  try {
    const response = await shopifyFetch<ShopifyProductByHandleResponse>(
      GET_PRODUCT_BY_HANDLE_QUERY,
      { handle }
    )

    const productNode = response.data.productByHandle

    if (!productNode) {
      console.warn(`⚠️ No product found with handle: ${handle}`)
      return null
    }

    const product = transformProduct(productNode)
    cache.set(cacheKey, { data: product, timestamp: Date.now() })
    return product
  } catch (error) {
    console.error(`❌ Error fetching product by handle (${handle}):`, error)
    if (cached) return cached.data
    return null
  }
}


export async function getRelatedProducts(productId: string): Promise<ShopifyProduct[]> {
  try {
    const response = await shopifyFetch<ShopifyRelatedProductsResponse>(
      GET_RELATED_PRODUCTS_QUERY,
      { productId }
    )

    const recommendations = response.data?.productRecommendations

    if (!recommendations || recommendations.length === 0) {
      console.warn(`⚠️ No related products found for productId: ${productId}`)
      return []
    }

    return recommendations.map(transformProduct)
  } catch (error) {
    console.error(`❌ Error fetching related products for (${productId}):`, error)
    return []
  }
}

export async function createShopifyCheckout(items: { merchandiseId: string; quantity: number }[]) {
  try {
    console.log("Creating Shopify checkout with items:", items);

    const response: ShopifyAPIResponse = await shopifyFetch(CART_CREATE_MUTATION, { lines: items });

    console.log("Full Shopify response:", response);

    if (!response?.data?.cartCreate) {
      throw new Error("Shopify response missing 'data.cartCreate'. Check your mutation or API version.");
    }

    const { cart, userErrors } = response.data.cartCreate;

    if (userErrors && userErrors.length > 0) {
      console.error("Shopify cart creation errors:", userErrors);
      throw new Error(userErrors.map(e => e.message).join(", "));
    }

    if (!cart?.checkoutUrl) {
      throw new Error("Checkout creation failed: Shopify did not return a checkout URL.");
    }

    return cart.checkoutUrl;
  } catch (error) {
    console.error("Error creating Shopify checkout:", error);
    throw error;
  }
}