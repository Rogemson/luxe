import { NextRequest, NextResponse } from 'next/server'
import { fetchCart, removeCartLines } from '@/lib/shopify-client'
import { customerCarts } from '@/app/api/customer/cart/route'
import crypto from 'crypto'

interface ShopifyCartLine {
  node: {
    id: string
  }
}

interface ShopifyCartResponse {
  data?: {
    cart?: {
      id: string
      lines?: {
        edges: ShopifyCartLine[]
      }
    }
  }
}

interface ShopifyRemoveCartLinesResponse {
  data?: {
    cartLinesRemove?: {
      userErrors?: { message: string }[]
    }
  }
}

interface ShippingLine {
  price: string
}

interface LineItem {
  variant_id: number
  product_title: string
  variant_title: string
  vendor?: string
  price: string
  quantity: number
}

interface Discount {
  code?: string
}

interface Customer {
  id: number
}

interface ShopifyOrder {
  id: number
  total_price: string
  subtotal_price: string
  tax_price: string
  currency: string
  shipping_lines: ShippingLine[]
  line_items: LineItem[]
  discount_applications: Discount[]
  customer: Customer
}

// Verify webhook signature
function verifyWebhookSignature(request: NextRequest, body: string): boolean {
  const hmacHeader = request.headers.get('X-Shopify-Hmac-SHA256')
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET || ''

  if (!hmacHeader || !clientSecret) {
    return false
  }

  const hash = crypto
    .createHmac('sha256', clientSecret)
    .update(body, 'utf8')
    .digest('base64')

  const isValid = hash === hmacHeader
  return isValid
}

async function trackGA4Purchase(orderData: ShopifyOrder): Promise<boolean> {
  try {
    const {
      id: orderId,
      total_price: totalPrice,
      tax_price: taxPrice,
      shipping_lines: shippingLines,
      line_items: lineItems,
      discount_applications: discounts,
      customer,
      currency,
    } = orderData

    const shippingCost = shippingLines?.[0]?.price || '0'

    interface GA4Item {
      item_id: string
      item_name: string
      item_variant: string
      item_category: string
      price: number
      quantity: number
      currency: string
    }

    const ga4Items: GA4Item[] = lineItems.map((item) => ({
      item_id: item.variant_id.toString(),
      item_name: item.product_title,
      item_variant: item.variant_title || 'Default',
      item_category: item.vendor || 'Product',
      price: parseFloat(item.price),
      quantity: item.quantity,
      currency: currency,
    }))

    const coupon = discounts?.[0]?.code
    const measurementId = process.env.NEXT_PUBLIC_GA_ID
    const apiSecret = process.env.GA4_API_SECRET

    if (!measurementId || !apiSecret) {
      return false
    }

    interface GA4Params {
      transaction_id: string
      value: number
      currency: string
      tax: number
      shipping: number
      coupon?: string
      items: GA4Item[]
    }

    interface GA4Event {
      name: string
      params: GA4Params
    }

    interface GA4Payload {
      client_id: string
      events: GA4Event[]
    }

    const ga4Payload: GA4Payload = {
      client_id: customer?.id?.toString() || 'anonymous',
      events: [
        {
          name: 'purchase',
          params: {
            transaction_id: orderId.toString(),
            value: parseFloat(totalPrice),
            currency: currency || 'USD',
            tax: parseFloat(taxPrice || '0'),
            shipping: parseFloat(shippingCost),
            coupon: coupon || undefined,
            items: ga4Items,
          },
        },
      ],
    }
    const gaResponse = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ga4Payload),
      }
    )

    if (!gaResponse.ok) {
      return false
    }

    return true
  } catch (error) {
    return false
  }
}

async function clearCustomerCart(customerId: string) {
  try {
    // Get the cart ID associated with this customer
    const cartId = customerCarts.get(customerId)
    
    if (!cartId) {
      console.log(`⚠️ No cart found for customer ${customerId}`)
      return
    }

    console.log(`🧹 Clearing cart ${cartId} for customer ${customerId}`)

    // Fetch current cart to get line item IDs
    const cartResponse = await fetchCart(cartId)
    
    if (!cartResponse?.data?.cart) {
      console.log(`⚠️ Cart ${cartId} not found or already cleared`)
      customerCarts.delete(customerId) // Remove stale reference
      return
    }

    const lines = cartResponse.data.cart.lines?.edges || []
    
    if (lines.length === 0) {
      console.log(`✅ Cart ${cartId} is already empty`)
      customerCarts.delete(customerId)
      return
    }

    // Extract all line item IDs
    const lineIds = lines.map((edge: ShopifyCartLine) => edge.node.id)
    console.log(`📦 Removing ${lineIds.length} items from cart`)

    // Remove all cart lines
    const removeResponse = await removeCartLines(cartId, lineIds)

    const userErrors = removeResponse.data?.cartLinesRemove?.userErrors ?? []
    if (userErrors.length > 0) {
      console.warn('⚠️ Shopify returned user errors:', userErrors)
      return
    }

    console.log(`✅ Successfully cleared cart ${cartId}`)

    // Remove cart reference from storage
    customerCarts.delete(customerId)
    console.log(`✅ Removed cart reference for customer ${customerId}`)
    
  } catch (error) {
    console.error('❌ Error clearing customer cart:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    console.log('\n🎯 === WEBHOOK RECEIVED ===')

    // Verify signature
    if (!verifyWebhookSignature(request, body)) {
      console.error('❌ Webhook signature verification failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orderData = JSON.parse(body)
    console.log('🛒 Order Details:')
    console.log('- Order #:', orderData.order_number)
    console.log('- Order ID:', orderData.id)
    console.log('- Status:', orderData.financial_status)
    console.log('- Customer:', orderData.customer?.email)
    console.log('- Customer ID:', orderData.customer?.id)
    console.log('- Total:', orderData.total_price)

    // Only process PAID orders
    if (orderData.financial_status !== 'paid') {
      console.log('⏭️ Skipping non-paid order (status: ' + orderData.financial_status + ')\n')
      return NextResponse.json({ skipped: true }, { status: 200 })
    }

    // Extract customer ID and clear their cart
    const customerId = orderData.customer?.id?.toString()
    if (customerId) {
      await clearCustomerCart(customerId)
    } else {
      console.warn('⚠️ No customer ID found in order data')
    }

    // Track in GA4
    const tracked = await trackGA4Purchase(orderData)
    if (!tracked) {
      console.error('❌ Failed to track purchase in GA4')
      return NextResponse.json({ error: 'GA4 tracking failed' }, { status: 500 })
    }

    console.log('✅ === WEBHOOK PROCESSED SUCCESSFULLY ===\n')
    return NextResponse.json({ success: true }, { status: 200 })

  } catch (error) {
    console.error('❌ Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
