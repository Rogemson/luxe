import { NextRequest, NextResponse } from "next/server"

// ⚠️ In production, use a real database (Prisma, Supabase, etc.)
// This is in-memory storage for development
export const customerCarts = new Map<string, string>()

export async function POST(request: NextRequest) {
  try {
    const { customerId, cartId } = await request.json()

    if (!customerId || !cartId) {
      return NextResponse.json(
        { error: "customerId and cartId required" },
        { status: 400 }
      )
    }

    // Extract numeric ID from GID format if present
    const numericCustomerId = customerId.includes('gid://shopify/Customer/') 
      ? customerId.split('/').pop() 
      : customerId

    customerCarts.set(numericCustomerId, cartId)
    console.log(`✅ Saved cart ${cartId} for customer ${numericCustomerId}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving cart:", error)
    return NextResponse.json(
      { error: "Failed to save cart" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get("customerId")

    if (!customerId) {
      return NextResponse.json(
        { error: "customerId required" },
        { status: 400 }
      )
    }

    // Extract numeric ID from Shopify GID format
    const numericCustomerId =
      customerId.includes("gid://shopify/Customer/")
        ? customerId.split("/").pop()!
        : customerId

    const cartId = customerCarts.get(numericCustomerId) || null
    console.log(`✅ Retrieved cart ${cartId} for customer ${numericCustomerId}`)

    return NextResponse.json({ cartId })
  } catch (error) {
    console.error("Error fetching cart:", error)
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    )
  }
}
