// lib/auth-utils.ts
import * as jose from 'jose'
import type { MagicLinkPayload, SessionPayload } from './types/auth-types'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this'
)
const MAGIC_LINK_EXPIRY = 15 * 60 * 1000 // 15 minutes
const SESSION_EXPIRY = 30 * 24 * 60 * 60 // 30 days in seconds

export async function generateMagicLinkToken(email: string): Promise<string> {
  const payload: MagicLinkPayload = {
    email,
    timestamp: Date.now()
  }

  const token = await new jose.SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('15m')
    .sign(JWT_SECRET)

  return token
}

export async function verifyMagicLinkToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET)
    const data = payload as unknown as MagicLinkPayload

    // Check if token is expired (15 minutes)
    if (Date.now() - data.timestamp > MAGIC_LINK_EXPIRY) {
      return null
    }

    return data.email
  } catch (error) {
    console.error('Error verifying magic link token:', error)
    return null
  }
}

export async function generateSessionToken(email: string, customerId?: string): Promise<string> {
  const payload: SessionPayload = {
    email,
    customerId,
    exp: Math.floor(Date.now() / 1000) + SESSION_EXPIRY
  }

  const token = await new jose.SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(JWT_SECRET)

  return token
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET)
    return payload as unknown as SessionPayload
  } catch (error) {
    return null
  }
}