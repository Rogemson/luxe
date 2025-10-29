import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
})

export interface AbandonedCartData {
  cartId: string
  customerEmail: string
  cartItems: Array<{
    title: string
    price: string
    quantity: number
  }>
  totalPrice: number
  createdAt: string
  emailSent: boolean
  emailSentAt?: string
}

/**
 * Track an abandoned cart in Redis
 */
export async function trackAbandonedCart({
  cartId,
  customerEmail,
  cartItems,
  totalPrice,
}: {
  cartId: string
  customerEmail: string
  cartItems: Array<{ title: string; price: string; quantity: number }>
  totalPrice: number
}): Promise<void> {
  try {
    const abandonedCartData: AbandonedCartData = {
      cartId,
      customerEmail,
      cartItems,
      totalPrice,
      createdAt: new Date().toISOString(),
      emailSent: false,
    }

    await redis.setex(
      `abandoned_cart:${cartId}`,
      86400,
      JSON.stringify(abandonedCartData)
    )

    console.log(`✅ Tracked abandoned cart: ${cartId}`)
  } catch (error) {
    console.error('❌ Error tracking abandoned cart:', error)
  }
}

/**
 * Get all abandoned carts older than 1 hour that haven't been emailed
 */
export async function getAbandonedCartsForEmail(): Promise<AbandonedCartData[]> {
  try {
    const keys = await redis.keys('abandoned_cart:*')
    const carts: AbandonedCartData[] = []

    for (const key of keys) {
      const cartJson = await redis.get(key)
      if (!cartJson) continue

      const cart = JSON.parse(cartJson as string) as AbandonedCartData

      if (!cart.emailSent && isOlderThanOneHour(cart.createdAt)) {
        carts.push(cart)
      }
    }

    return carts
  } catch (error) {
    console.error('❌ Error fetching abandoned carts:', error)
    return []
  }
}

/**
 * Mark an abandoned cart email as sent
 */
export async function markEmailAsSent(cartId: string): Promise<void> {
  try {
    const cartJson = await redis.get(`abandoned_cart:${cartId}`)
    if (!cartJson) return

    const cart = JSON.parse(cartJson as string) as AbandonedCartData
    cart.emailSent = true
    cart.emailSentAt = new Date().toISOString()

    await redis.setex(
      `abandoned_cart:${cartId}`,
      86400,
      JSON.stringify(cart)
    )

    console.log(`✅ Marked email as sent for cart: ${cartId}`)
  } catch (error) {
    console.error('❌ Error marking email as sent:', error)
  }
}

/**
 * Remove an abandoned cart (when customer completes purchase)
 */
export async function markCartAsRecovered(cartId: string): Promise<void> {
  try {
    await redis.del(`abandoned_cart:${cartId}`)
    console.log(`✅ Removed recovered cart: ${cartId}`)
  } catch (error) {
    console.error('❌ Error marking cart as recovered:', error)
  }
}

/**
 * Check if a date is older than 1 hour
 */
function isOlderThanOneHour(createdAt: string): boolean {
  const oneHourInMs = 60 * 60 * 1000
  return Date.now() - new Date(createdAt).getTime() > oneHourInMs
}