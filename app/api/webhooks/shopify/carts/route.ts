import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { trackAbandonedCart } from '@/lib/abandoned-carts'

interface ShopifyCartItem {
  title: string
  price: string
  quantity: number
}

interface ShopifyCartData {
  id: string
  email?: string
  line_items?: ShopifyCartItem[]
  total_price?: string
}

function verifyWebhookSignature(request: NextRequest, body: string): boolean {
  const hmacHeader = request.headers.get('X-Shopify-Hmac-SHA256')
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET ?? ''

  if (!hmacHeader || !clientSecret) {
    return false
  }

  const hash = crypto
    .createHmac('sha256', clientSecret)
    .update(body, 'utf8')
    .digest('base64')

  return hash === hmacHeader
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()

    if (!verifyWebhookSignature(request, body)) {
      console.error('❌ Cart webhook signature verification failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cartData: ShopifyCartData = JSON.parse(body)

    console.log('🛒 Cart Update Webhook Received:', {
      cartId: cartData.id,
      email: cartData.email,
      itemsCount: cartData.line_items?.length ?? 0,
    })

    if (cartData.email && cartData.line_items && cartData.line_items.length > 0) {
      const cartItems = cartData.line_items.map((item) => ({
        title: item.title,
        price: item.price,
        quantity: item.quantity,
      }))

      await trackAbandonedCart({
        cartId: cartData.id,
        customerEmail: cartData.email,
        cartItems,
        totalPrice: parseFloat(cartData.total_price ?? '0'),
      })

      console.log('✅ === CART WEBHOOK PROCESSED ===\n')
    } else {
      console.log('⏭️ Skipping cart: missing email or items\n')
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('❌ Cart webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
