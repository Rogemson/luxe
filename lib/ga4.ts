// lib/ga4.ts

/**
 * GA4 E-commerce Item Interface
 */
export interface GA4EcommerceItem {
  item_id: string // Product/variant ID
  item_name: string // Product name
  item_category?: string // Product category
  item_variant?: string // Variant (color, size, etc.)
  price?: number // Unit price
  quantity?: number // Quantity
  currency?: string // Currency code (USD, EUR, etc.)
  index?: number // Position in list
  [key: string]: unknown // Allow custom fields
}

/**
 * GA4 Event Parameters Interface
 */
export interface GA4EventParams {
  items?: GA4EcommerceItem[]
  value?: number // Monetary value
  currency?: string
  transaction_id?: string
  coupon?: string
  item_list_id?: string
  item_list_name?: string
  tax?: number
  shipping?: number
  payment_type?: string
  page_title?: string
  page_path?: string
  search_term?: string
  results_count?: number
  user_properties?: Record<string, string>
  user_id?: string
  [key: string]: unknown
}

/**
 * GA4 Config Parameters Interface
 */
export interface GA4ConfigParams {
  allow_google_signals?: boolean
  allow_ad_personalization_signals?: boolean
  user_id?: string
  user_properties?: Record<string, string>
  [key: string]: unknown
}

/**
 * Window interface with gtag
 */
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'set',
      targetId: string,
      params?: GA4EventParams | GA4ConfigParams
    ) => void
    dataLayer?: object[]
  }
}

/**
 * Ensure gtag is available and initialized
 */
function ensureGtag(): boolean {
  if (typeof window === 'undefined') return false
  if (typeof window.gtag === 'undefined') {
    console.warn('⚠️ GA4 gtag is not available')
    return false
  }
  return true
}

/**
 * Core GA4 event tracking
 * @param eventName - GA4 event name
 * @param eventParams - Event parameters
 */
export function trackGA4Event(
  eventName: string,
  eventParams: GA4EventParams = {}
): void {
  if (!ensureGtag() || !window.gtag) return

  console.log(`📊 GA4 Event: ${eventName}`, eventParams)
  window.gtag('event', eventName, eventParams)
}

/**
 * PAGE VIEW TRACKING
 */

/**
 * Track page view
 */
export function trackPageView(pageTitle: string, pagePath: string): void {
  trackGA4Event('page_view', {
    page_title: pageTitle,
    page_path: pagePath,
  })
}

/**
 * PRODUCT INTERACTIONS
 */

/**
 * Track when product is viewed
 */
export function trackViewItem(
  product: GA4EcommerceItem,
  currency: string = 'USD'
): void {
  trackGA4Event('view_item', {
    items: [product],
    currency,
  })
}

/**
 * Track viewing a list of products (collections, search results, etc.)
 */
export function trackViewItemList(
  items: GA4EcommerceItem[],
  listName: string,
  listId: string,
  currency: string = 'USD'
): void {
  trackGA4Event('view_item_list', {
    item_list_name: listName,
    item_list_id: listId,
    items,
    currency,
  })
}

/**
 * Track when user clicks a product
 */
export function trackSelectItem(
  product: GA4EcommerceItem,
  listName: string,
  listId: string,
  index: number,
  currency: string = 'USD'
): void {
  trackGA4Event('select_item', {
    item_list_name: listName,
    item_list_id: listId,
    items: [
      {
        ...product,
        index,
      },
    ],
    currency,
  })
}

/**
 * CART INTERACTIONS
 */

/**
 * Track adding item to cart
 */
export function trackAddToCart(
  items: GA4EcommerceItem[],
  value: number,
  currency: string = 'USD'
): void {
  trackGA4Event('add_to_cart', {
    items,
    value,
    currency,
  })
}

/**
 * Track removing item from cart
 */
export function trackRemoveFromCart(
  items: GA4EcommerceItem[],
  value: number,
  currency: string = 'USD'
): void {
  trackGA4Event('remove_from_cart', {
    items,
    value,
    currency,
  })
}

/**
 * Track viewing cart
 */
export function trackViewCart(
  items: GA4EcommerceItem[],
  value: number,
  currency: string = 'USD'
): void {
  trackGA4Event('view_cart', {
    items,
    value,
    currency,
  })
}

/**
 * CHECKOUT FLOW
 */

/**
 * Track beginning checkout
 */
export function trackBeginCheckout(
  items: GA4EcommerceItem[],
  value: number,
  currency: string = 'USD'
): void {
  trackGA4Event('begin_checkout', {
    items,
    value,
    currency,
  })
}

/**
 * Track adding shipping/payment info
 */
export function trackAddPaymentInfo(
  items: GA4EcommerceItem[],
  value: number,
  paymentType: string,
  currency: string = 'USD'
): void {
  trackGA4Event('add_payment_info', {
    items,
    value,
    payment_type: paymentType,
    currency,
  })
}

/**
 * Track successful purchase
 */
export function trackPurchase(
  transactionId: string,
  items: GA4EcommerceItem[],
  value: number,
  tax?: number,
  shipping?: number,
  coupon?: string,
  currency: string = 'USD'
): void {
  trackGA4Event('purchase', {
    transaction_id: transactionId,
    items,
    value,
    tax,
    shipping,
    coupon,
    currency,
  })
}

/**
 * Track purchase refund
 */
export function trackRefund(
  transactionId: string,
  items: GA4EcommerceItem[],
  value: number,
  currency: string = 'USD'
): void {
  trackGA4Event('refund', {
    transaction_id: transactionId,
    items,
    value,
    currency,
  })
}

/**
 * WISHLIST INTERACTIONS
 */

/**
 * Track adding item to wishlist
 */
export function trackAddToWishlist(
  items: GA4EcommerceItem[],
  value: number,
  currency: string = 'USD'
): void {
  trackGA4Event('add_to_wishlist', {
    items,
    value,
    currency,
  })
}

/**
 * SEARCH TRACKING
 */

/**
 * Track search
 */
export function trackSearch(searchTerm: string, resultsCount: number): void {
  trackGA4Event('search', {
    search_term: searchTerm,
    results_count: resultsCount,
  })
}

/**
 * CUSTOM EVENTS
 */

/**
 * Track custom event (for anything not covered above)
 */
export function trackCustomEvent(
  eventName: string,
  params: GA4EventParams
): void {
  trackGA4Event(eventName, params)
}

/**
 * UTILITY FUNCTIONS
 */

/**
 * Initialize GA4 (if needed manually)
 */
export function initializeGA4(measurementId: string): void {
  if (!ensureGtag() || !window.gtag) {
    console.error('❌ Cannot initialize GA4: gtag not available')
    return
  }

  const config: GA4ConfigParams = {
    allow_google_signals: true,
    allow_ad_personalization_signals: true,
  }

  window.gtag('config', measurementId, config)
  console.log('✅ GA4 initialized with ID:', measurementId)
}

/**
 * Set user ID for cross-device tracking
 */
export function setUserId(userId: string): void {
  if (!ensureGtag() || !window.gtag) return

  const gaId = process.env.NEXT_PUBLIC_GA_ID
  if (!gaId) {
    console.warn('⚠️ NEXT_PUBLIC_GA_ID not found in environment')
    return
  }

  const config: GA4ConfigParams = {
    user_id: userId,
  }

  window.gtag('config', gaId, config)
  console.log('✅ User ID set:', userId)
}

/**
 * Set user properties (custom dimensions)
 */
export function setUserProperties(properties: Record<string, string>): void {
  if (!ensureGtag() || !window.gtag) return

  const params: GA4EventParams = {
    user_properties: properties,
  }

  window.gtag('set', 'user_properties', params)
  console.log('✅ User properties set:', properties)
}

/**
 * Clear user ID (on logout)
 */
export function clearUserId(): void {
  if (!ensureGtag() || !window.gtag) return

  const gaId = process.env.NEXT_PUBLIC_GA_ID
  if (!gaId) {
    console.warn('⚠️ NEXT_PUBLIC_GA_ID not found in environment')
    return
  }

  const config: GA4ConfigParams = {
    user_id: undefined,
  }

  window.gtag('config', gaId, config)
  console.log('✅ User ID cleared')
}