import { NextRequest, NextResponse } from 'next/server'
import { shopifyFetch } from '@/lib/shopify-client'
import { ShopifyCustomerQueryResponse } from '@/lib/shopify-types'

const GET_CUSTOMER = `
  query getCustomer($token: String!) {
    customer(customerAccessToken: $token) {
      id
      email
      firstName
      lastName
      phone
      defaultAddress {
        address1
        city
        province
        zip
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

    const result = await shopifyFetch<ShopifyCustomerQueryResponse>(GET_CUSTOMER, {
      token
    })

    const customer = result.data?.customer
    const errors = result.errors

    if (errors) {
      return NextResponse.json(
        { error: 'Failed to fetch customer' },
        { status: 400 }
      )
    }

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      customer
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
