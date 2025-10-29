import { Redis } from '@upstash/redis'

// Initialize Upstash Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
})

// Simple wrapper with same interface as Map
export const customerCarts = {
  async get(customerId: string): Promise<string | null> {
    return redis.get<string>(`cart:${customerId}`)
  },

  async set(customerId: string, cartId: string): Promise<void> {
    // Set with 30-day expiration (auto-cleanup)
    await redis.setex(`cart:${customerId}`, 2592000, cartId)
  },

  async delete(customerId: string): Promise<void> {
    await redis.del(`cart:${customerId}`)
  },

  // Helper for debugging
  async keys(): Promise<string[]> {
    const allKeys = await redis.keys('cart:*')
    return allKeys.map(key => key.replace('cart:', ''))
  }
}