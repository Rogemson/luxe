export interface MagicLinkPayload {
  email: string
  timestamp: number
}

export interface AuthUser {
  email: string
  customerId?: string
  firstName?: string
  lastName?: string
}

export interface SessionPayload {
  email: string
  customerId?: string
  exp: number
}