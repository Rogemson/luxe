import { NextRequest, NextResponse } from 'next/server'
import { shopifyFetch } from '@/lib/shopify-client'

const CUSTOMER_LOGIN = `
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
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
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }

    const result = await shopifyFetch(CUSTOMER_LOGIN, {
      input: { email, password }
    })

    const token = (result as any).data?.customerAccessTokenCreate?.customerAccessToken?.accessToken
    const errors = (result as any).data?.customerAccessTokenCreate?.userErrors

    if (errors && errors.length > 0) {
      return NextResponse.json(
        { error: errors[0]?.message || 'Login failed' },
        { status: 400 }
      )
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Login failed' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      token
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
