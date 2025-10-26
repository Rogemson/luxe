import { NextRequest, NextResponse } from "next/server"
import { createCustomerAccessToken } from "@/lib/shopify-client"

// ✅ Add proper response type
interface CustomerAccessTokenResponse {
  data?: {
    customerAccessTokenCreate?: {
      customerAccessToken?: {
        accessToken: string
        expiresAt: string
      }
      userErrors?: Array<{
        field?: string
        message: string
      }>
    }
  }
  errors?: Array<{
    message: string
  }>
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      )
    }

    // Create customer access token with proper typing
    const result = (await createCustomerAccessToken({
      email,
      password,
    })) as CustomerAccessTokenResponse

    const token = result?.data?.customerAccessTokenCreate?.customerAccessToken?.accessToken
    const userErrors = result?.data?.customerAccessTokenCreate?.userErrors

    if (userErrors && userErrors.length > 0) {
      return NextResponse.json(
        { error: userErrors[0]?.message || "Login failed" },
        { status: 401 }
      )
    }

    if (!token) {
      return NextResponse.json(
        { error: "Failed to generate access token" },
        { status: 401 }
      )
    }

    // Return token (client will store in localStorage)
    return NextResponse.json(
      { token, success: true },
      {
        headers: {
          "Set-Cookie": `auth_token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict`,
        },
      }
    )
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    )
  }
}
