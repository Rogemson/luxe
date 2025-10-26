import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json(
    { success: true },
    {
      headers: {
        "Set-Cookie": "auth_token=; Path=/; HttpOnly; Max-Age=0",
      },
    }
  )
}
