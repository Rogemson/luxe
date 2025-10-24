import { NextRequest, NextResponse } from 'next/server'
import { shopifyFetch } from '@/lib/shopify-client'

const GET_ORDERS = `
  query getOrders($token: String!) {
    customer(customerAccessToken: $token) {
      orders(first: 10) {
        edges {
          node {
            id
            orderNumber
            processedAt
            statusUrl
            totalPrice {
              amount
              currencyCode
            }
            fulfillmentStatus
            lineItems(first: 5) {
              edges {
                node {
                  title
                  quantity
                  variant {
                    image {
                      url
                    }
                    title
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Token required' },
        { status: 400 }
      )
    }

    console.log('📦 [ORDERS] Fetching orders...')

    const result = await shopifyFetch(GET_ORDERS, {
      token
    })

    const ordersEdges = (result as any).data?.customer?.orders?.edges || []
    const errors = (result as any).errors

    if (errors) {
      console.error('❌ [ORDERS] Error:', errors)
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 400 }
      )
    }

    const orders = ordersEdges.map((edge: any, index: number) => ({
      id: edge.node.id || `order-${index}`,
      number: edge.node.orderNumber,
      date: edge.node.processedAt,
      total: edge.node.totalPrice.amount,
      currency: edge.node.totalPrice.currencyCode,
      status: edge.node.fulfillmentStatus,
      items: edge.node.lineItems.edges.map((item: any, itemIndex: number) => ({
        id: `${index}-${itemIndex}`,
        title: item.node.title,
        quantity: item.node.quantity,
        variantTitle: item.node.variant?.title || 'N/A',
        image: item.node.variant?.image?.url
      }))
    }))

    console.log('✅ [ORDERS] Fetched:', orders.length, 'orders')

    return NextResponse.json({
      orders
    })

  } catch (error: any) {
    console.error('❌ [ORDERS] Exception:', error.message)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
