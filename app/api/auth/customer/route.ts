import { NextRequest, NextResponse } from 'next/server'
import { shopifyFetch } from '@/lib/shopify-client'

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

    console.log('👤 [CUSTOMER] Fetching customer data...')

    const result = await shopifyFetch(GET_CUSTOMER, {
      token
    })

    const customer = (result as any).data?.customer
    const errors = (result as any).errors

    if (errors) {
      console.error('❌ [CUSTOMER] Error:', errors)
      return NextResponse.json(
        { error: 'Failed to fetch customer' },
        { status: 400 }
      )
    }

    if (!customer) {
      console.error('❌ [CUSTOMER] No customer found')
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    console.log('✅ [CUSTOMER] Fetched:', customer.email)

    return NextResponse.json({
      customer
    })

  } catch (error: any) {
    console.error('❌ [CUSTOMER] Exception:', error.message)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
