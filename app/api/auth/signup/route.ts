import { NextRequest, NextResponse } from 'next/server'
import { shopifyFetch } from '@/lib/shopify-client'

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

    const result = await shopifyFetch(CREATE_CUSTOMER, {
      input: {
        email,
        firstName,
        lastName,
        password
      }
    })

    const customer = (result as any).data?.customerCreate?.customer
    const errors = (result as any).data?.customerCreate?.userErrors

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

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
