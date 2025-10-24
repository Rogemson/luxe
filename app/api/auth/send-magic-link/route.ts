// app/api/auth/send-magic-link/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { generateMagicLinkToken } from '@/lib/auth-utils'
import { shopifyFetch } from '@/lib/shopify-client'
import { CUSTOMER_CREATE_MUTATION } from '@/lib/queries/customer-queries'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    // Check if customer exists in Shopify, if not create one
    try {
      await shopifyFetch(CUSTOMER_CREATE_MUTATION, {
        input: {
          email,
          acceptsMarketing: false
        }
      })
    } catch (error) {
      // Customer might already exist, that's okay
      console.log('Customer may already exist:', email)
    }

    // Generate magic link token
    const token = await generateMagicLinkToken(email)
    const magicLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verify?token=${token}`

    // Send email using Resend
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: 'Your Magic Link to Sign In',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Sign in to Your Account</h2>
          <p style="color: #666; font-size: 16px;">
            Click the button below to sign in to your account. This link will expire in 15 minutes.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${magicLink}" 
               style="background-color: #000; color: #fff; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Sign In
            </a>
          </div>
          <p style="color: #999; font-size: 14px;">
            If you didn't request this email, you can safely ignore it.
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            Or copy and paste this URL into your browser:<br/>
            ${magicLink}
          </p>
        </div>
      `
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Magic link sent to your email' 
    })
  } catch (error) {
    console.error('Error sending magic link:', error)
    return NextResponse.json(
      { error: 'Failed to send magic link' },
      { status: 500 }
    )
  }
}