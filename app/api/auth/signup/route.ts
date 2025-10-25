import { NextRequest, NextResponse } from 'next/server'
import { shopifyFetch } from '@/lib/shopify-client'
import { ShopifyCustomerCreateResponse } from '@/lib/shopify-types'

const CREATE_CUSTOMER = `
  mutation createCustomer($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
      }
      userErrors {
        field
        message
      }
    }
  }
`

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, password } = await request.json()

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'All fields required' },
        { status: 400 }
      )
    }

    const result = await shopifyFetch<ShopifyCustomerCreateResponse>(CREATE_CUSTOMER, {
      input: {
        email,
        firstName,
        lastName,
        password
      }
    })

    const customer = result.data?.customerCreate?.customer
    const errors = result.data?.customerCreate?.userErrors

    if (errors && errors.length > 0) {
      return NextResponse.json(
        { error: errors[0]?.message || 'Signup failed' },
        { status: 400 }
      )
    }

    if (!customer?.id) {
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      customerId: customer.id
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
