import { NextRequest, NextResponse } from 'next/server'
import { shopifyFetch } from '@/lib/shopify-client'
import { ShopifyOrdersResponse, FormattedOrder, ShopifyOrderNode } from '@/lib/shopify-types'

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

interface OrderEdge {
  node: ShopifyOrderNode;
}

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

    const result = await shopifyFetch<ShopifyOrdersResponse>(GET_ORDERS, {
      token
    })

    const ordersEdges: OrderEdge[] = result.data?.customer?.orders?.edges || []
    const errors = result.errors

    if (errors) {
      console.error('❌ [ORDERS] Error:', errors)
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 400 }
      )
    }

    const orders: FormattedOrder[] = ordersEdges.map((edge, index) => ({
      id: edge.node.id || `order-${index}`,
      number: edge.node.orderNumber,
      date: edge.node.processedAt,
      total: edge.node.totalPrice.amount,
      currency: edge.node.totalPrice.currencyCode,
      status: edge.node.fulfillmentStatus,
      items: edge.node.lineItems.edges.map((item, itemIndex) => ({
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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    console.error('❌ [ORDERS] Exception:', errorMessage)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
