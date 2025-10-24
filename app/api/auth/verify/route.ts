// app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyMagicLinkToken, generateSessionToken } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(new URL('/login?error=invalid_token', request.url))
    }

    const email = await verifyMagicLinkToken(token)

    if (!email) {
      return NextResponse.redirect(new URL('/login?error=expired_token', request.url))
    }

    const sessionToken = await generateSessionToken(email)

    // Correct way to set cookie
    const response = NextResponse.redirect(new URL('/account', request.url))
    response.cookies.set({
      name: 'auth_token',
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Error verifying magic link:', error)
    return NextResponse.redirect(new URL('/login?error=verification_failed', request.url))
  }
}
