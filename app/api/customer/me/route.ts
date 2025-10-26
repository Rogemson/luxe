import { NextRequest, NextResponse } from "next/server"
import { fetchCustomer } from "@/lib/shopify-client"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: "Token required" },
        { status: 400 }
      )
    }

    const result = await fetchCustomer(token)
    const customer = result?.data?.customer

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ customer })
  } catch (error) {
    console.error("Error fetching customer:", error)
    return NextResponse.json(
      { error: "Failed to fetch customer" },
      { status: 500 }
    )
  }
}
